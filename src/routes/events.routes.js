import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  changeStatus,
} from '../controllers/events.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

// Rutas publicas
router.get('/', getEvents);
router.get('/:id', getEventById);

// Rutas protegidas: primero se autentica, despues se autoriza por rol
router.post('/', authenticate('current'), authorize('organizer', 'admin'), createEvent);
router.put('/:id', authenticate('current'), authorize('organizer', 'admin'), updateEvent);

// PATCH porque solo modifica un campo (status), no el recurso entero.
router.patch(
  '/:id/status',
  authenticate('current'),
  authorize('organizer', 'admin'),
  changeStatus
);

export default router;