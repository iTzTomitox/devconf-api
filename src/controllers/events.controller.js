import { eventsService } from '../services/events.service.js';

/**
 * Controller de eventos.
 * Solo coordina request/response. La logica de negocio y las
 * validaciones de permisos sobre recursos viven en el service.
 */

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getEvents();

    res.status(200).json({
      status: 'success',
      payload: events,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getEventById(req.params.id);

    res.status(200).json({
      status: 'success',
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * El usuario autenticado se pasa al service para que asigne
 * el organizador. Nunca viene del body.
 */

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventsService.createEvent(req.body, req.user);

    res.status(201).json({
      status: 'success',
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * El service valida si el usuario puede modificar este evento.
 */

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventsService.updateEvent(req.params.id, req.body, req.user);

    res.status(200).json({
      status: 'success',
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};