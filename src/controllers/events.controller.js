import { eventsService } from '../services/events.service.js';

/**
 * Controller de eventos.
 * Su unico trabajo: leer la request, llamar al service
 * y devolver la response. Nada de logica de negocio aca.
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