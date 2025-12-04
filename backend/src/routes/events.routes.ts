import { Router } from 'express';
import * as eventsController from '../controllers/events.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['admin', 'operator']), eventsController.list);
router.post('/', authenticate, authorize(['admin', 'operator']), eventsController.create);

export default router;
