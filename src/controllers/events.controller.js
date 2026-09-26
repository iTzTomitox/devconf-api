import { eventsService } from '../services/events.service.js';
import { toEventDTO, toEventListDTO } from '../dto/event.dto.js';

/**
 * Controller de eventos.
 * Solo coordina request/response. La logica de negocio y las
 * validaciones de permisos sobre recursos viven en el service.
 */

export const getEvents = async (req, res, next) => {
  try {
    const result = await eventsService.getEvents(req.query);
    const { data, ...pagination } = result;

    res.status(200).json({
      status: 'success',
      data: toEventListDTO(data),
      ...pagination,
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
      payload: toEventDTO(event),
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
      payload: toEventDTO(event),
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
      payload: toEventDTO(event),
    });
  } catch (error) {
    next(error);
  }
};

export const changeStatus = async (req, res, next) => {
  try {
    const event = await eventsService.changeStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    res.status(200).json({
      status: 'success',
      payload: toEventDTO(event),
    });
  } catch (error) {
    next(error);
  }
};