import passport from '../config/passport.config.js';
import { badRequest, unauthorized } from '../utils/errors.js';

/**
 * @param strategyName  nombre de la estrategia registrada
 * @param buildError    funcion que arma el error cuando no hay usuario
 */

export const authenticate =
  (strategyName, buildError = () => unauthorized('No autenticado')) =>
  (req, res, next) => {
    passport.authenticate(strategyName, { session: false }, (error, user, info) => {
      // El service lanzo un error de negocio: ya trae su statusCode
      if (error) {
        return next(error);
      }

      if (!user) {
        // passport-local corta antes del callback si faltan credenciales
        if (info?.message === 'Missing credentials') {
          return next(badRequest('Faltan campos obligatorios'));
        }
        return next(buildError());
      }

      req.user = user;
      return next();
    })(req, res, next);
  };