import { Router, Request, Response, NextFunction } from 'express';

// Model
import RuleSet from '../models/RuleSet';

class RuleSetController {

    constructor() {   
      this.addRulesets = this.addRulesets.bind(this);
      this.getAllRulesets = this.getAllRulesets.bind(this);
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
      const newRuleset = new RuleSet(newRulesetData);
      newRuleset.save(function(errOnAdd, newRulesetData) {
        if (errOnAdd) return res.status(500).json({errOnAdd});
        return res.status(200).json({newRulesetData});
      });
    };

    public getAllRulesets = (req: Request, res: Response) => {
      RuleSet.find({}).lean().exec(function(errRuleSet, rulesets){
        return res.status(201).json({ rulesets })
      })
    };
}

export default new RuleSetController();