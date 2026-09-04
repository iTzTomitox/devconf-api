// src/dao/events.dao.js
import { Event } from '../models/event.model.js';

class EventsDAO {

  async findAll(filter = {}) {
    return Event.find(filter).lean();
  }

  async findById(id) {
    return Event.findById(id).lean();
  }

  async findOne(filter) {
    return Event.findOne(filter).lean();
  }

  async create(data) {
    const created = await Event.create(data);
    return created.toObject();
  }

  async update(id, data) {
    return Event.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  }

  async count(filter = {}) {
    return Event.countDocuments(filter);
  }

  async paginate(filter = {}, { skip = 0, limit = 10, sort = {} } = {}) {
    const [documents, total] = await Promise.all([
      Event.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Event.countDocuments(filter),
    ]);

    return { documents, total };
  }
}

export const eventsDAO = new EventsDAO();