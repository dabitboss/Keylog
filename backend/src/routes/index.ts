import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import rolesRoutes from './roles.routes';
import devicesRoutes from './devices.routes';
import eventsRoutes from './events.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/devices', devicesRoutes);
router.use('/events', eventsRoutes);

export default router;
