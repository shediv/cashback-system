import { Router, Request, Response } from 'express';
const router = Router();

// Controller
import TransactionController from '../controllers/transaction';

router.route('/')
    .get((req: Request, res: Response) => TransactionController.getAllTransactions(req, res))
    .post((req: Request, res: Response) => TransactionController.addTransaction(req, res));

router.route('/delete/:id')
    .put((req: Request, res: Response) => TransactionController.deleteTransaction(req, res))    

export default router;