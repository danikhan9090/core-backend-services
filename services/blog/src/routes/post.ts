import { Router } from 'express';
import {
  createPost,
  getPosts,
  updatePost,
  softDeletePost,
} from '../controllers/postController';

const router = Router();

router.post('/', createPost);
router.get('/', getPosts);
router.put('/:id', updatePost);
router.delete('/:id', softDeletePost);

export default router; 