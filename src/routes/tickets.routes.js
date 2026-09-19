import { Router } from 'express';
import { getMyTickets, cancelTicket } from '../controllers/tickets.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/my-tickets', authenticate('current'), getMyTickets);

router.patch('/:tid/cancel', authenticate('current'), cancelTicket);

export default router;