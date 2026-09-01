import { eventsRepository } from '../repositories/events.repository.js';
import { badRequest, notFound, forbidden } from '../utils/errors.js';

class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getEvents() {
    return this.repository.findAll();
  }

  async getEventById(id) {
    const event = await this.repository.findById(id);

    if (!event) {
      throw notFound('Evento no encontrado');
    }

    return event;
  }

  async createEvent(eventData, requester) {
    const { title, description, category, date, location, capacity, price } = eventData;

    if (!title || !description || !category || !date || !location) {
      throw badRequest('Faltan campos obligatorios');
    }

    return this.repository.create({
      title,
      description,
      category,
      date,
      location,
      capacity,
      price,
      organizer: requester.id,
    });
  }

  async updateEvent(eventId, updates, requester) {
    const event = await this.repository.findById(eventId);

    if (!event) {
      throw notFound('Evento no encontrado');
    }

    const isOwner = String(event.organizer) === String(requester.id);
    const isAdmin = requester.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw forbidden('No podés modificar un evento que no te pertenece');
    }

    const { organizer, ...allowedUpdates } = updates;

    return this.repository.update(eventId, allowedUpdates);
  }
}

export const eventsService = new EventsService(eventsRepository);