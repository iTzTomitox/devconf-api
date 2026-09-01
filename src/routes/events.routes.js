import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
} from '../controllers/events.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticate('current'), authorize('organizer', 'admin'), createEvent);
router.put('/:id', authenticate('current'), authorize('organizer', 'admin'), updateEvent);

export default router;