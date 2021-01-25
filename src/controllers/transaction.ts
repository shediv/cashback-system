import { Router, Request, Response, NextFunction } from 'express';
import async from 'async';

// Model
import Transaction from '../models/Transaction';
import RuleSet from '../models/RuleSet';
import CustomerTransactions from '../models/CustomerTransactions';
import Cashback from '../models/Cashback';

class TransactionController {

    constructor() {  
        this.addTransaction = this.addTransaction.bind(this);
        this.getAllTransactions = this.getAllTransactions.bind(this);
        this.getApplicableRulesetsAndCT = this.getApplicableRulesetsAndCT.bind(this);
    }

    getApplicableRulesetsAndCT = (res: Response, date: String, customerId: Number, transactionId: Number) => {
        async.parallel({
            allRulesets: function(callbackInner) {
                RuleSet.find({ 
                    startDate: { "$lte": date }, 
                    endDate: { "$gte": date }
                }).lean().sort({ cashback: -1 }).exec(function(errRuleSet, rulesets){
                    callbackInner(errRuleSet, rulesets);
                });
            },
            allCustTransactions: function(callbackInner) {
                CustomerTransactions.aggregate(
                    [
                        { $match: { 'customerId' : customerId } },
                        { $group: {
                            _id: '$rulsetApplied',
                            count: { $sum: 1}, 
                        }}
                    ]
                ).exec(function ( errorCT, custTransactionsData) {
                    callbackInner(errorCT, custTransactionsData);           
                });
            }
        },
        function(err, results) {
            let { allRulesets, allCustTransactions } = results;

            // Merge Rulesets and counts from customer_transactions
            let mergedRulesetData = allRulesets.map(item => ({
                ...item,
                ...allCustTransactions.find(({ _id }) => _id == item._id),
            }));

            // Select the applicable ruleset based on ruleset conditions
            let applicableRuleset:Object = {};
            let cashBackData:any = {};
            let customerTransactionsData:any = {};
            mergedRulesetData.forEach((currentRuleset) => {
                if(currentRuleset.redemptionLimit) {
                    if((currentRuleset.count < currentRuleset.redemptionLimit)) {
                        applicableRuleset = currentRuleset;
                        // Data to be added to cashback
                        cashBackData.transactionId = transactionId;
                        cashBackData.amount = currentRuleset.cashback;

                        // Data to be added to customer_transactions
                        customerTransactionsData.transactionId = transactionId;
                        customerTransactionsData.rulsetApplied = currentRuleset._id;
                        customerTransactionsData.cashbackReceived = currentRuleset.cashback;
                        customerTransactionsData.customerId = customerId;
                        customerTransactionsData.date = date;
                    } else {
                        // Move on to next ruleset
                    }
                } else {
                    applicableRuleset = currentRuleset;
                    // Data to be added to cashback
                    cashBackData.transactionId = transactionId;
                    cashBackData.amount = currentRuleset.cashback;

                    // Data to be added to customer_transactions
                    customerTransactionsData.transactionId = transactionId;
                    customerTransactionsData.rulsetApplied = currentRuleset._id;
                    customerTransactionsData.cashbackReceived = currentRuleset.cashback;
                    customerTransactionsData.customerId = customerId;
                    customerTransactionsData.date = date;
                }
            });

            // Add customer_transaction entry 
            const newCustomerTransaction = new CustomerTransactions(customerTransactionsData);
            newCustomerTransaction.save(function(errOnCustomerTransaction, newCustomerTransactionData) {
                if (errOnCustomerTransaction) console.log("errOnCustomerTransaction = ", errOnCustomerTransaction);
                // return res.status(200).json({newCustomerTransactionData});

                // Add cashback entry
                const newCashback = new Cashback(cashBackData)
                newCashback.save(function(errOnCashback, newCashbackData) {
                    if (errOnCashback) console.log("errOnCashback = ", errOnCashback);
                    return res.status(200).json({ mergedRulesetData, applicableRuleset, cashBackData, customerTransactionsData, newCustomerTransactionData, newCashbackData });
                })

            });

            // return results;
            // return res.status(200).json({ mergedRulesetData, applicableRuleset, cashBackData, customerTransactionsData });
        });
    }

    addTransaction(req: Request, res: Response) {
        const { date, customerId, id } = req.body;

        // Add the new transaction
        const newTransaction = new Transaction({ date, customerId, id });
        newTransaction.save(function(errOnAdd, newRulesetData) {
            if (errOnAdd) return res.status(500).json({errOnAdd});
            // res.status(200).json({newRulesetData});
            this.getApplicableRulesetsAndCT(res, date, customerId, id);
        });            
    };

    getAllTransactions(req: Request, res: Response) {
        Transaction.find({}).lean().exec(function(errRuleSet, rulesets){
            return res.status(201).json({ rulesets })
        })
    };
    
}

export default new TransactionController();