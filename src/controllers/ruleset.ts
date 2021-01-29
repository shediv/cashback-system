import { Router, Request, Response, NextFunction } from 'express';

// Model
import RuleSet from '../models/RuleSet';

class RuleSetController {

    constructor() {   
      this.addRulesets = this.addRulesets.bind(this);
      this.getAllRulesets = this.getAllRulesets.bind(this);
      this.deleteRuleset = this.deleteRuleset.bind(this);
    }

    public addRulesets = (req: Request, res: Response) => {
      let newRulesetData = {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        cashback: req.body.cashback,
      };
      if (req.body.redemptionLimit) {
        newRulesetData['redemptionLimit'] =  req.body.redemptionLimit
      }

      if (req.body.minTransactions) {
        newRulesetData['minTransactions'] =  req.body.minTransactions
      }

      if (req.body.budget) {
        newRulesetData['budget'] =  req.body.budget
      }

      const newRuleset = new RuleSet(newRulesetData);
      newRuleset.save(function(errOnAdd, newRulesetData) {
        if (errOnAdd) return res.status(500).json({errOnAdd});
        return res.status(200).json(newRulesetData);
      });
    };

    public getAllRulesets = (req: Request, res: Response) => {
      RuleSet.find({}, {startDate: 1, endDate: 1, cashback: 1, redemptionLimit: 1}).lean().exec(function(errRuleSet, rulesets){
        return res.status(201).json(rulesets)
      })
    };

    public deleteRuleset = (req: Request, res: Response) => {
      const { id } = req.params;
      RuleSet.findByIdAndDelete(id).lean().exec(function(errDelRuleSet, delRulesets){
        return res.status(201).json(delRulesets)
      })
    };
}

export default new RuleSetController();