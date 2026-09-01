import { Router } from 'express';
import { getUsers } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

/**
 * Ruta administrativa: solo admin.
 *   401 -> sin sesion
 *   403 -> con sesion pero rol distinto de admin
 */
router.get('/', authenticate('current'), authorize('admin'), getUsers);

export default router;