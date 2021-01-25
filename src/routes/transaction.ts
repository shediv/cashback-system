import { Router, Request, Response } from 'express';
const router = Router();

// Controller
import TransactionController from '../controllers/transaction';

router.route('/')
    .get((req: Request, res: Response) => TransactionController.getAllTransactions(req, res))
    .post((req: Request, res: Response) => TransactionController.addTransaction(req, res));

router.route('/list')
    .get((req: Request, res: Response) => TransactionController.getAll(req, res))    

export default router;