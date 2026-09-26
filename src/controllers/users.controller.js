import { sessionsService } from '../services/sessions.service.js';
import { toUserListDTO } from '../dto/user.dto.js';

/**
 * Listado de usuarios. Ruta administrativa.
 */

export const getUsers = async (req, res, next) => {
  try {
    const users = await sessionsService.getAllUsers();

    res.status(200).json({
      status: 'success',
      payload: toUserListDTO(users),
    });
  } catch (error) {
    next(error);
  }
};