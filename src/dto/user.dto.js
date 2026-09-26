/**
 * Elimina las claves con valor undefined.
 * Evita que la respuesta traiga campos vacios cuando la fuente
 * es parcial (por ejemplo el payload del JWT, que no trae nombre).
 */
const compact = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

/**
 * Forma publica de un usuario.
 * `password` no figura: no es que se borre, es que nunca se copia.
 * Esa es la diferencia entre lista blanca y lista negra.
 */
export const toUserDTO = (user) => {
  if (!user) return null;

  return compact({
    id: String(user._id ?? user.id),
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
  });
};

export const toUserListDTO = (users = []) => users.map(toUserDTO);