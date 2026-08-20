import { config } from '../config/config.js';
import { generateToken } from '../utils/jwt.js';


const COOKIE_NAME = 'currentUser';

const COOKIE_OPTIONS = {
  httpOnly: true,                              // invisible para JavaScript
  sameSite: 'lax',                             // no se envia desde otros sitios
  secure: config.nodeEnv === 'production',     // solo por HTTPS en produccion
  maxAge: 3600000,                             // 1 hora en milisegundos
};

export const register = (req, res) => {
  res.status(201).json({
    status: 'success',
    payload: req.user,
  });
};

export const login = (req, res) => {
  const token = generateToken({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

  res.status(200).json({
    status: 'success',
    message: 'Login correcto',
  });
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