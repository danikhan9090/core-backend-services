import { Router } from 'express';
import {
  createForm,
  updateForm,
  getForm,
} from '../controllers/formController';

const router = Router();

router.post('/', createForm);
router.put('/:id', updateForm);
router.get('/:id', getForm);

export default router; 