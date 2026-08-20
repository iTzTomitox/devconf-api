import { Router } from 'express';
import { register, login, current, logout } from '../controllers/sessions.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { unauthorized } from '../utils/errors.js';

const router = Router();

router.post('/register', authenticate('register'), register);
router.post(
  '/login',
  authenticate('login', () => unauthorized('Credenciales inválidas')),
  login
);
router.get('/current', authenticate('current'), current);
router.post('/logout', logout);

export default router;