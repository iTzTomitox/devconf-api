import { unauthorized, forbidden } from '../utils/errors.js';

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(unauthorized('No autenticado'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(forbidden('No tenés permisos para realizar esta acción'));
  }

  return next();
};