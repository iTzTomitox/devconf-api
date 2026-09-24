import crypto from 'node:crypto';
import { ticketsRepository } from '../repositories/tickets.repository.js';
import { eventsRepository } from '../repositories/events.repository.js';
import { badRequest, notFound, forbidden, conflict } from '../utils/errors.js';
import { mailService } from './mail.service.js';
import { usersRepository } from '../repositories/users.repository.js';


export class TicketsService {
  constructor({ repository, eventsRepository, usersRepository, mailer }) {
    this.repository = repository;
    this.eventsRepository = eventsRepository;
    this.usersRepository = usersRepository;
    this.mailer = mailer;
  }


  async createTicket(eventId, { quantity } = {}, requester) {
    const event = await this.eventsRepository.findById(eventId);

    if (!event) {
      throw notFound('Evento no encontrado');
    }

    if (event.status !== 'published') {
      throw conflict('Solo se puede reservar en eventos publicados');
    }

    if (new Date(event.date).getTime() <= Date.now()) {
      throw conflict('El evento ya ocurrió');
    }

    const requestedQuantity = this.#validateQuantity(quantity);

    const alreadyRegistered = await this.repository.findActiveByUserAndEvent(
      requester.id,
      eventId
    );

    if (alreadyRegistered) {
      throw conflict('Ya tenés una inscripción activa para este evento');
    }

    const reserved = await this.eventsRepository.reserveSeats(
      eventId,
      requestedQuantity
    );

    if (!reserved) {
      const availableSeats = Math.max(event.capacity - (event.seatsTaken ?? 0), 0);
      throw conflict(
        `No hay cupo suficiente. Lugares disponibles: ${availableSeats}`
      );
    }

    let ticket;

    try {
      ticket = await this.repository.create({
        reservationCode: this.#generateCode(),
        user: requester.id,
        event: eventId,
        quantity: requestedQuantity,
        unitPrice: event.price,
        totalPrice: event.price * requestedQuantity,
      });
    } catch (error) {
      await this.eventsRepository.releaseSeats(eventId, requestedQuantity);
      throw error;
    }

    await this.mailer.sendTicketConfirmation({
      to: requester.email,
      ticket,
      event,
    });

    return ticket;
  }


  async getMyTickets(requester) {
    return this.repository.findByUser(requester.id);
  }


  async getEventTickets(eventId, requester) {
    const event = await this.eventsRepository.findById(eventId);

    if (!event) {
      throw notFound('Evento no encontrado');
    }

    const isOwner = String(event.organizer) === String(requester.id);
    const isAdmin = requester.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw forbidden('No podés ver los inscriptos de un evento que no te pertenece');
    }

    return this.repository.findByEvent(eventId);
  }

  async cancelTicket(ticketId, requester) {
    const ticket = await this.repository.findById(ticketId);

    if (!ticket) {
      throw notFound('Ticket no encontrado');
    }

    const isOwner = String(ticket.user) === String(requester.id);
    const isAdmin = requester.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw forbidden('No podés cancelar una inscripción que no te pertenece');
    }

    if (ticket.status === 'cancelled') {
      throw conflict('La inscripción ya estaba cancelada');
    }

    const cancelled = await this.repository.update(ticketId, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });

    await this.eventsRepository.releaseSeats(ticket.event, ticket.quantity);

    await this.#notifyCancellation(cancelled);

    return cancelled;
  }

  /**
   * Avisa por mail que la inscripcion fue cancelada.
   *
   * El correo va al DUEÑO del ticket, no a quien ejecuto la
   * cancelacion: si un admin cancela la inscripcion de otro, el que
   * tiene que enterarse es el asistente.
   */
  async #notifyCancellation(ticket) {
    const [event, owner] = await Promise.all([
      this.eventsRepository.findById(ticket.event),
      this.usersRepository.findById(ticket.user),
    ]);

    // Si falta alguno, no avisamos, pero la cancelacion ya es valida.
    if (!event || !owner) return;

    await this.mailer.sendTicketCancellation({
      to: owner.email,
      ticket,
      event,
    });
  }


  #validateQuantity(quantity) {
    // Si no viene, se asume 1 entrada.
    if (quantity === undefined) return 1;

    const value = Number(quantity);

    if (!Number.isInteger(value) || value < 1) {
      throw badRequest('La cantidad debe ser un número entero mayor o igual a 1');
    }

    return value;
  }

  /**
   * Codigo legible del ticket: TKT-XXXXXXXX
   * randomBytes da 4 bytes aleatorios = 8 caracteres hexadecimales.
   */
  #generateCode() {
    return `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
}

export const ticketsService = new TicketsService({
  repository: ticketsRepository,
  eventsRepository,
  usersRepository,
  mailer: mailService,
});