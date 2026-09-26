import { toUserDTO } from './user.dto.js';

const compact = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

/** Un ref viene "populado" si trae campos propios del usuario. */
const isPopulatedUser = (value) => Boolean(value) && value.email !== undefined;

export const toEventDTO = (event) => {
  if (!event) return null;

  const hasCapacity = event.capacity !== undefined;

  return compact({
    id: String(event._id ?? event.id),
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date,
    location: event.location,
    capacity: event.capacity,
    seatsTaken: hasCapacity ? (event.seatsTaken ?? 0) : undefined,
    // Se calcula acá y no en el modelo: es informacion para el
    // cliente, no un dato que haya que persistir.
    availableSeats: hasCapacity
      ? Math.max(event.capacity - (event.seatsTaken ?? 0), 0)
      : undefined,
    price: event.price,
    status: event.status,
    organizer: isPopulatedUser(event.organizer)
      ? toUserDTO(event.organizer)
      : event.organizer && String(event.organizer),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  });
};

export const toEventListDTO = (events = []) => events.map(toEventDTO);