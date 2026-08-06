import { usersRepository } from '../repositories/users.repository.js';
import { createHash } from '../utils/hash.js';
import { badRequest, conflict } from '../utils/errors.js';

const PASSWORD_MIN_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * SessionsService - logica de negocio de usuarios y autenticacion.
 */
class SessionsService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Registra un usuario nuevo.
   *
   * Orden de las operaciones:
   *   1. validar    -> si los datos estan mal, cortamos antes de tocar la base
   *   2. normalizar -> el email se guarda siempre igual
   *   3. duplicados -> se busca con el email YA normalizado
   *   4. hashear    -> bcrypt es lento, se hace lo mas tarde posible
   *   5. crear      -> solo con los campos permitidos
   *   6. limpiar    -> nunca sale la password hacia afuera
   */
  async register({ first_name, last_name, email, password }) {
    this.#validateRegisterData({ first_name, last_name, email, password });

    const normalizedEmail = email.trim().toLowerCase();

    const alreadyExists = await this.repository.existsByEmail(normalizedEmail);
    if (alreadyExists) {
      throw conflict('El email ya está registrado');
    }

    const hashedPassword = await createHash(password);
    const createdUser = await this.repository.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return this.#toPublicUser(createdUser);
  }

  #validateRegisterData({ first_name, last_name, email, password }) {
    if (!first_name || !last_name || !email || !password) {
      throw badRequest('Faltan campos obligatorios');
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      throw badRequest('El formato del email no es válido');
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      throw badRequest(
        `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
      );
    }
  }
  #toPublicUser(user) {
    return {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    };
  }
}

export const sessionsService = new SessionsService(usersRepository);