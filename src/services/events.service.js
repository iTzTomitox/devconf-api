import { eventsRepository } from '../repositories/events.repository.js';


class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getEvents() {
    return this.repository.findAll();
  }

  async getEventById(id) {
    return this.repository.findById(id);
  }
}

export const eventsService = new EventsService(eventsRepository);