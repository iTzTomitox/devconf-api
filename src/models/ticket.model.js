import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    reservationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indice para las dos consultas mas frecuentes:
//   - los tickets de un usuario
//   - los tickets de un evento (para calcular cupos)
ticketSchema.index({ user: 1, event: 1 });
ticketSchema.index({ event: 1, status: 1 });

export const Ticket = mongoose.model('Ticket', ticketSchema);