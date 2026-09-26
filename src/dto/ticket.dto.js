import { toUserDTO } from './user.dto.js';
import { toEventDTO } from './event.dto.js';

/**
 * Un ref puede venir como ObjectId (sin populate) o como documento
 * completo (con populate). Se detecta buscando un campo propio de
 * la entidad: un ObjectId no tiene `email` ni `title`.
 */
const isPopulatedUser = (value) => Boolean(value) && value.email !== undefined;
const isPopulatedEvent = (value) => Boolean(value) && value.title !== undefined;

/**
 * Forma publica de una inscripcion.
 *
 * Cuando el ref viene populado se delega en el DTO de esa entidad:
 * asi el filtrado del documento relacionado tambien pasa por DTO y
 * no depende de que el DAO se haya acordado de limitar los campos.
 * Doble barrera: la consulta no trae de mas y el DTO no deja salir de mas.
 */
export const toTicketDTO = (ticket) => {
  if (!ticket) return null;

  return {
    id: String(ticket._id ?? ticket.id),
    reservationCode: ticket.reservationCode,
    user: isPopulatedUser(ticket.user)
      ? toUserDTO(ticket.user)
      : ticket.user && String(ticket.user),
    event: isPopulatedEvent(ticket.event)
      ? toEventDTO(ticket.event)
      : ticket.event && String(ticket.event),
    quantity: ticket.quantity,
    unitPrice: ticket.unitPrice,
    totalPrice: ticket.totalPrice,
    status: ticket.status,
    createdAt: ticket.createdAt,
    cancelledAt: ticket.cancelledAt,
  };
};

export const toTicketListDTO = (tickets = []) => tickets.map(toTicketDTO);