import { Router, Request, Response } from 'express';
const router = Router();

// Controller
import RuleSetController from '../controllers/ruleset';

router.route('/')
    .get((req: Request, res: Response) => RuleSetController.getAllRulesets(req, res))
    .post((req: Request, res: Response) => RuleSetController.addRulesets(req, res))

router.route('/delete/:id')
    .put((req: Request, res: Response) => RuleSetController.deleteRuleset(req, res))  

export default router;