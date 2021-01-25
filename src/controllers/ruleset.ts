import { Router, Request, Response, NextFunction } from 'express';

// Model
import RuleSet from '../models/RuleSet';

class RuleSetController {

    constructor() {   
      this.addRulesets = this.addRulesets.bind(this);
      this.getAllRulesets = this.getAllRulesets.bind(this);
    }

    addRulesets(req: Request, res: Response) {
      const { startDate, endDate, cashback } = req.body;
      const newRuleset = new RuleSet({ startDate, endDate, cashback });
      newRuleset.save(function(errOnAdd, newRulesetData) {
        if (errOnAdd) return res.status(500).json({errOnAdd});
        return res.status(200).json({newRulesetData});
      });
    };

    getAllRulesets(req: Request, res: Response) {
      RuleSet.find({}).lean().exec(function(errRuleSet, rulesets){
        return res.status(201).json({ rulesets })
      })
    };
}

export default new RuleSetController();