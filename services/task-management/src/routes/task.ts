import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { validateRequest } from '../middleware/validateRequest';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksSchema,
  getTaskSchema,
  deleteTaskSchema,
} from '../validations/task';

const router = Router();

// Task routes
router.post('/', validateRequest(createTaskSchema), createTask);
router.get('/', validateRequest(listTasksSchema), getTasks);
router.get('/:id', validateRequest(getTaskSchema), getTask);
router.put('/:id', validateRequest(updateTaskSchema), updateTask);
router.delete('/:id', validateRequest(deleteTaskSchema), deleteTask);

export default router; 