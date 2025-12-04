import { Router } from 'express';
import * as devicesController from '../controllers/devices.controller';
import * as deviceEventsController from '../controllers/device-events.controller';
import { authenticate, authorize } from '../middleware/auth';
import { verifyDeviceSignature } from '../middleware/device-auth';

const router = Router();

router.post('/wiegand', verifyDeviceSignature, deviceEventsController.ingestWiegand);
router.get('/', authenticate, authorize(['admin', 'operator']), devicesController.list);
router.post('/', authenticate, authorize(['admin']), devicesController.register);
router.patch('/:id', authenticate, authorize(['admin']), devicesController.update);

export default router;
