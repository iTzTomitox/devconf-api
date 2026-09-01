import { Router } from 'express';
import healthRouter from './health.routes.js';
import eventsRouter from './events.routes.js';
import sessionsRouter from './sessions.routes.js';
import usersRouter from './users.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/events', eventsRouter);
router.use('/sessions', sessionsRouter);
router.use('/users', usersRouter);

export default router;