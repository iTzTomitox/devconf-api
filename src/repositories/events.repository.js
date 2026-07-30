import { eventsDAO } from '../dao/events.dao.js';

class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async findAll() {
    return this.dao.findAll();
  }

  async findById(id) {
    return this.dao.findById(id);
  }

  async findPublished() {
    return this.dao.findAll({ status: 'published' });
  }

  async create(eventData) {
    return this.dao.create(eventData);
  }

  async update(id, eventData) {
    return this.dao.update(id, eventData);
  }

  async countByStatus(status) {
    return this.dao.count({ status });
  }
}

export const eventsRepository = new EventsRepository(eventsDAO);