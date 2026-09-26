import { ticketsService } from '../services/tickets.service.js';
import { toTicketDTO, toTicketListDTO } from '../dto/ticket.dto.js';

export const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.createTicket(
      req.params.eid,
      req.body,
      req.user
    );

    res.status(201).json({
      status: 'success',
      payload: toTicketDTO(ticket),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketsService.getMyTickets(req.user);

    res.status(200).json({
      status: 'success',
      payload: toTicketListDTO(tickets),
    });
  } catch (error) {
    next(error);
  }
};

export const getEventTickets = async (req, res, next) => {
  try {
    const tickets = await ticketsService.getEventTickets(req.params.eid, req.user);

    res.status(200).json({
      status: 'success',
      payload: toTicketListDTO(tickets),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.cancelTicket(req.params.tid, req.user);

    res.status(200).json({
      status: 'success',
      payload: toTicketDTO(ticket),
    });
  } catch (error) {
    next(error);
  }
};