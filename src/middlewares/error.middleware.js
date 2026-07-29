import { config } from '../config/config.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, next) => {
  
  const statusCode = error.statusCode || 500;

  
  const message =
    statusCode === 500 && config.nodeEnv === 'production'
      ? 'Error interno del servidor'
      : error.message || 'Error interno del servidor';

  
  if (statusCode === 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, error);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
  });
};