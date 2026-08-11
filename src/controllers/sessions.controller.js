import { sessionsService } from '../services/sessions.service.js';
import { config } from '../config/config.js';

/**
 * Configuracion de la cookie de sesion.
 * Se define una sola vez para que login y logout usen exactamente
 * las mismas opciones: si no coinciden, el navegador no borra la cookie.
 */
const COOKIE_NAME = 'currentUser';

const COOKIE_OPTIONS = {
  httpOnly: true,                              // invisible para JavaScript
  sameSite: 'lax',                             // no se envia desde otros sitios
  secure: config.nodeEnv === 'production',     // solo por HTTPS en produccion
  maxAge: 3600000,                             // 1 hora en milisegundos
};

export const register = async (req, res, next) => {
  try {
    const user = await sessionsService.register(req.body);

    res.status(201).json({
      status: 'success',
      payload: user,
    });
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { token } = await sessionsService.login(req.body);

    // El token viaja en la cookie, no en el cuerpo de la respuesta
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    res.status(200).json({
      status: 'success',
      message: 'Login correcto',
    });
  } catch (error) {
    next(error);
  }
};

export const current = (req, res) => {
  // req.user lo dejo el authMiddleware. Si llegamos aca,
  // la sesion ya fue validada.
  res.status(200).json({
    status: 'success',
    payload: req.user,
  });
};

export const logout = (req, res) => {
  // clearCookie necesita las MISMAS opciones con las que se creo
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);

  res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada',
  });
};