import mongoose from 'mongoose';
import { Ticket } from '../models/ticket.model.js';

class TicketsDAO {
  async create(data) {
    const created = await Ticket.create(data);
    return created.toObject();
  }

  async findById(id) {
    return Ticket.findById(id).lean();
  }

  async findOne(filter) {
    return Ticket.findOne(filter).lean();
  }

  async update(id, data) {
    return Ticket.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  }


  async findByUser(userId) {
    return Ticket.find({ user: userId })
      .populate('event', 'title date location status')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByEvent(eventId) {
    return Ticket.find({ event: eventId })
      .populate('user', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async sumActiveQuantityByEvent(eventId) {
    const [result] = await Ticket.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(String(eventId)),
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' },
        },
      },
    ]);

    // Si no hay tickets, aggregate devuelve un array vacio.
    return result?.total ?? 0;
  }
}

export const ticketsDAO = new TicketsDAO();