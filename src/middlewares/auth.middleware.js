import { verifyToken } from '../utils/jwt.js';
import { unauthorized } from '../utils/errors.js';

const COOKIE_NAME = 'currentUser';

/**
 * Protege rutas que requieren sesion.
 *
 * Lee el JWT desde la cookie, lo verifica y deja el payload
 * en req.user para que el resto de la cadena sepa quien pide.
 *
 * Responde 401 si no hay cookie o el token es invalido/expirado.
 */
export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return next(unauthorized('No autenticado'));
  }

  try {
    // verifyToken lanza si la firma no coincide o el token vencio
    const payload = verifyToken(token);

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    // No distinguimos "expirado" de "manipulado":
    // en ambos casos el resultado es el mismo, no hay sesion valida
    next(unauthorized('No autenticado'));
  }
};