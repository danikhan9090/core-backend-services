import { Router } from 'express';
import {
  createWorkflow,
  updateWorkflow,
  getWorkflow,
} from '../controllers/workflowController';

const router = Router();

router.post('/', createWorkflow);
router.put('/:id', updateWorkflow);
router.get('/:id', getWorkflow);

export default router; 