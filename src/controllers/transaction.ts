import { Router, Request, Response, NextFunction } from 'express';
import async from 'async';

// Model
import TransactionModel from '../models/Transaction';
import RuleSetModel from '../models/RuleSet';
import CustomerTransactionsModel from '../models/CustomerTransactions';
import CashbackModel from '../models/Cashback';

class TransactionController {
    private Cashback = CashbackModel;
    private CustomerTransactions = CustomerTransactionsModel;
    private Transaction = TransactionModel;
    private RuleSet = RuleSetModel;

    constructor() { 
        this.addTransaction = this.addTransaction.bind(this);
        this.getAllTransactions = this.getAllTransactions.bind(this);
        this.deleteTransaction = this.deleteTransaction.bind(this);
    }

    public getAllTransactions = (req: Request, res: Response) => {
        this.Transaction.find({}).lean().exec(function(errTransactions, transactions){
            return res.status(201).json(transactions)
        })
    };

    public deleteTransaction = (req: Request, res: Response) => {
        const { id } = req.params;
        this.Transaction.findByIdAndDelete(id).lean().exec(function(errDelTransaction, delTransaction){
          return res.status(201).json(delTransaction)
        })
    };

    public addTransaction = async (req: Request, res: Response) => {
        const { date, id } = req.body;
        const customerId = req.body.customerId || 0; // If no customerId passed using 0 as default value
        // Add the new transaction
        const newTransaction = new this.Transaction({ date, customerId, id });
        const newTransactionData = await newTransaction.save();

        // Get Previous transactions count
        const allCustTransactions = await this.getCustomerTransactions(customerId);
        // Get all ruleset applicable for transaction date
        const allRulesets = await this.getAllRulesets(date);
        const allTransactionsByCustomer = await this.getAllTransactionsByCustomer(customerId);
        if(allRulesets.length < 1) return res.status(500).json({ msg: "No cashback available" }); 
        // return res.status(200).json({ allCustTransactions, allRulesets });         

        // Merge Rulesets and counts from customer_transactions
        let mergedRulesetData = allRulesets.map(item => ({
            ...item,
            ...allCustTransactions.find(({ _id }) => _id == item._id),
        }));

        // Select the applicable ruleset based on ruleset conditions
        let applicableRuleset = await this.getApplicableRuleset(mergedRulesetData, allTransactionsByCustomer);
        // return res.status(200).json({ mergedRulesetData, applicableRuleset });

        // If any ruleset is applicable then add cashback & also add customer_transaction data
        if(Object.entries(applicableRuleset).length) {
            let newCustomerTransactionData = await this.addNewCustomerTransaction(id, applicableRuleset, customerId, date);
            let addNewCashbackData = await this.addNewCashback(id, applicableRuleset);
            return res.status(200).json(newTransactionData);
        } else {
            return res.status(500).json({ msg: "No cashback available" });
        }
    }

    private getCustomerTransactions = async (customerId: any) => {
        if(customerId > 0) {
            const customerTransactionLists = await this.CustomerTransactions.aggregate(
                [
                    { $match: { 'customerId' : customerId } },
                    { $group: {
                        _id: '$rulsetApplied',
                        count: { $sum: 1},
                        budgetSpent : { $sum: "$cashbackReceived" }
                    }}
                ]
            );
            return customerTransactionLists;
        } else {
            const customerTransactionLists = await this.CustomerTransactions.aggregate(
                [
                    { $group: {
                        _id: '$rulsetApplied',
                        count: { $sum: 1},
                        budgetSpent : { $sum: "$cashbackReceived" } 
                    }}
                ]
            );
            return customerTransactionLists;
        }
    }

    private getAllTransactionsByCustomer = async (customerId: any) => {
        const transactionsByCus = await this.Transaction.find({ 'customerId' : customerId }).count();
        return transactionsByCus;
    }

    private getAllRulesets = async (date: String) => {
        const allRulesets = await this.RuleSet.find({ 
            startDate: { "$lte": date }, 
            endDate: { "$gte": date }
        }).lean().sort({ cashback: -1 }).exec()
        return allRulesets;
    }
    
    private getApplicableRuleset = async (mergedRulesetData: any, transByCusCount: Number) => {
        let i = 0;
        let applicableRulestFound =  false;
        let applicableRulest = {};
        do {
            var currentRuleset = mergedRulesetData[i];
            let redemptionLimitCheckTrue = await this.redemptionLimitCheck(currentRuleset);
            let minTransactionsCheckTrue = await this.minTransactionsCheck(currentRuleset, transByCusCount);
            let budgetCheckTrue = await this.budgetCheck(currentRuleset);

            if(redemptionLimitCheckTrue && minTransactionsCheckTrue && budgetCheckTrue) {
                applicableRulest = currentRuleset;
                applicableRulestFound = true;
            }
            i++
        } while(i < mergedRulesetData.length && !applicableRulestFound)
        return applicableRulest;
    }

    private redemptionLimitCheck = async (rulesetData:any) => {
        let redemptionLimitCheckPassed:Boolean = false;
        var currentIterationRuleset = rulesetData;
        if (currentIterationRuleset.redemptionLimit) {
            if(currentIterationRuleset.hasOwnProperty('count')) {
                if(currentIterationRuleset.count < currentIterationRuleset.redemptionLimit) {
                    redemptionLimitCheckPassed =  true;
                }                        
            } else {
                redemptionLimitCheckPassed =  true;
            }
        } else {
            redemptionLimitCheckPassed =  true;
        }
        
        return redemptionLimitCheckPassed;
    }

    private minTransactionsCheck = async (rulesetData:any, transByCusCount:Number) => {
        let minTransactionsCheckPassed:Boolean = false;
        var currentIterationRuleset = rulesetData;
        if (currentIterationRuleset.minTransactions) {
            if(transByCusCount > currentIterationRuleset.minTransactions) {
                minTransactionsCheckPassed =  true;
            }                        
        } else {
            minTransactionsCheckPassed =  true;
        }
        
        return minTransactionsCheckPassed;
    }

    private budgetCheck = async (rulesetData:any) => {
        let budgetCheckPassed:Boolean = false;
        var currentIterationRuleset = rulesetData;
        if (currentIterationRuleset.budget) {
            if(currentIterationRuleset.hasOwnProperty('budgetSpent')) {
                if(currentIterationRuleset.budgetSpent < currentIterationRuleset.budget) {
                    budgetCheckPassed =  true;
                }                       
            } else {
                budgetCheckPassed =  true;
            }
        } else {
            budgetCheckPassed =  true;
        }
        
        return budgetCheckPassed;
    }

    private addNewCustomerTransaction = async (transactionId: Number, rulset: any, customerId: Number, date: String) => {
        const custTransData = {
            transactionId,
            customerId,
            date,
            rulsetApplied: rulset._id,
            cashbackReceived: rulset.cashback
        };
        // Add the new CustomerTransactions
        const newCustomerTransactions = new this.CustomerTransactions(custTransData);
        const newCustomerTransactionsData = await newCustomerTransactions.save();
        return newCustomerTransactionsData;
    }

    private addNewCashback = async (transactionId: Number, rulset: any) => {
        const cashbackData = {
            transactionId,
            rulsetApplied: rulset._id,
            amount: rulset.cashback
        };
        // Add cashback entry
        const newCashback = new this.Cashback(cashbackData);
        const newCashbackData = await newCashback.save();
        return newCashbackData;
    }
    
}

export default new TransactionController();