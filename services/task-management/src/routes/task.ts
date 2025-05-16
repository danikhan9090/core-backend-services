import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticate } from '@backend-services/shared';
import { validateRequest } from '../middleware/validateRequest';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksSchema,
  getTaskSchema,
  deleteTaskSchema,
} from '../validations/task';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task routes
router.post('/', validateRequest(createTaskSchema), createTask);
router.get('/', validateRequest(listTasksSchema), getTasks);
router.get('/:id', validateRequest(getTaskSchema), getTask);
router.put('/:id', validateRequest(updateTaskSchema), updateTask);
router.delete('/:id', validateRequest(deleteTaskSchema), deleteTask);

export default router; 