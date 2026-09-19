import { ticketsDAO } from '../dao/tickets.dao.js';

class TicketsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(ticketData) {
    return this.dao.create(ticketData);
  }

  async findById(id) {
    return this.dao.findById(id);
  }

  async update(id, ticketData) {
    return this.dao.update(id, ticketData);
  }

  async findByUser(userId) {
    return this.dao.findByUser(userId);
  }

  async findByEvent(eventId) {
    return this.dao.findByEvent(eventId);
  }

  async countOccupiedSeats(eventId) {
    return this.dao.sumActiveQuantityByEvent(eventId);
  }

  /** Busca el ticket activo de un usuario en un evento (si existe). */
  async findActiveByUserAndEvent(userId, eventId) {
    return this.dao.findOne({ user: userId, event: eventId, status: 'active' });
  }
}

export const ticketsRepository = new TicketsRepository(ticketsDAO);