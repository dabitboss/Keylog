import { Router } from 'express';
import * as rolesController from '../controllers/roles.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['admin']), rolesController.list);
router.post('/', authenticate, authorize(['admin']), rolesController.create);

export default router;
