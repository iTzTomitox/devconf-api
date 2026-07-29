/**
 * Responde el estado del servidor.
 * Un controller siempre recibe (req, res) y su unico trabajo
 * es devolver una respuesta.
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor activo',
  });
};