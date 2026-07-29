export const register = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Registro de usuarios pendiente de implementacion',
  });
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