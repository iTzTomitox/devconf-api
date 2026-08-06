import { sessionsService } from '../services/sessions.service.js';

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


export const login = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Login pendiente de implementacion',
  });
};

export const current = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Consulta de usuario actual pendiente de implementacion',
  });
};

export const logout = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Cierre de sesion pendiente de implementacion',
  });
};