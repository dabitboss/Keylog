import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['admin']), usersController.list);
router.get('/:id', authenticate, authorize(['admin']), usersController.get);
router.post('/', authenticate, authorize(['admin']), usersController.create);
router.patch('/:id', authenticate, authorize(['admin']), usersController.update);
router.delete('/:id', authenticate, authorize(['admin']), usersController.remove);

export default router;
