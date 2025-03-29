import { Router } from 'express';
import {
  getRootController,
  postRootController,
} from '../controllers/rootController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/', ctrlWrapper(getRootController));
router.post('/', ctrlWrapper(postRootController));

export default router;