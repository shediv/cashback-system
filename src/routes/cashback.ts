import { Router, Request, Response } from 'express';
const router = Router();

// Controller
import CashbackController from '../controllers/cashback';

router.route('/')
    .get((req: Request, res: Response) => CashbackController.getAllCashbacks(req, res))

export default router;