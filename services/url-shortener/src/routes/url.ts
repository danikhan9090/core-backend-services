import { Router } from 'express';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import {
  createUrl,
  getUrl,
  updateUrl,
  deleteUrl,
  listUrls
} from '../controllers/urlController';
import {
  createUrlSchema,
  getUrlSchema,
  updateUrlSchema,
  deleteUrlSchema,
  listUrlsSchema
} from '../validations/url';

const router = Router();

// Public routes
router.get('/:shortCode', validate(getUrlSchema), getUrl);

// Protected routes
router.use(auth);
router.post('/', validate(createUrlSchema), createUrl);
router.get('/', validate(listUrlsSchema), listUrls);
router.patch('/:shortCode', validate(updateUrlSchema), updateUrl);
router.delete('/:shortCode', validate(deleteUrlSchema), deleteUrl);

export default router; 