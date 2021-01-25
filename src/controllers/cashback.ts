import { Router, Request, Response, NextFunction } from 'express';

// Model
import Cashback from '../models/Cashback';

class CashbackController {

    constructor() {   
      this.getAllCashbacks = this.getAllCashbacks.bind(this);
    }

    getAllCashbacks(req: Request, res: Response) {
        Cashback.find({}).lean().exec(function(errCashback, cashbacks){
            return res.status(201).json({ cashbacks })
        })
    };
}

export default new CashbackController();