import { Router } from 'express';
import {
  generateCompletion,
  generateImage,
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/completion', authenticate, generateCompletion);
router.post('/image', authenticate, generateImage);

export default router; 