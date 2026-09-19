import { eventsRepository } from '../repositories/events.repository.js';
import { badRequest, notFound, forbidden, conflict } from '../utils/errors.js';

const VALID_STATUSES = ['draft', 'published', 'cancelled', 'finished'];
const IMMUTABLE_STATUSES = ['cancelled', 'finished'];
const ALLOWED_TRANSITIONS = {
  draft: ['published', 'cancelled'],
  published: ['cancelled', 'finished'],
  cancelled: [],
  finished: [],
};
const SORTABLE_FIELDS = ['date', 'price', 'title', 'createdAt'];
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;


export class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getEvents(query = {}) {
    const filter = this.#buildFilter(query);
    const sort = this.#buildSort(query.sort);
    const { page, limit } = this.#buildPagination(query);

    const skip = (page - 1) * limit;

    const { documents, total } = await this.repository.paginate(filter, {
      skip,
      limit,
      sort,
    });

    return {
      data: documents,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async getEventById(id) {
    const event = await this.repository.findById(id);

    if (!event) {
      throw notFound('Evento no encontrado');
    }

    return event;
  }

  /**
   * Crea un evento aplicando las reglas de negocio.
   * El organizador se toma del usuario autenticado, nunca del body.
   */
  async createEvent(eventData, requester) {
    const { title, description, category, date, location, capacity, price } = eventData;

    if (!title || !description || !category || !date || !location) {
      throw badRequest('Faltan campos obligatorios');
    }

    this.#validateDate(date);
    this.#validateCapacity(capacity);
    this.#validatePrice(price);

    return this.repository.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim().toLowerCase(),
      date: new Date(date),
      location: location.trim(),
      capacity: Number(capacity),
      price: price === undefined ? 0 : Number(price),
      organizer: requester.id,
    });
  }
  /**
   * Traduce los query params a un filtro de MongoDB.
   * Solo agrega al filtro los parametros que vinieron.
   */
  #buildFilter({ status, category, location, dateFrom, dateTo }) {
    const filter = {};

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        throw badRequest(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`);
      }
      filter.status = status;
    }

    if (category) {
      filter.category = String(category).trim().toLowerCase();
    }

    if (location) {
      // Busqueda parcial e insensible a mayusculas.
      // Se escapan los caracteres especiales para que el usuario
      // no pueda inyectar una expresion regular arbitraria.
      const safe = String(location).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.location = { $regex: safe, $options: 'i' };
    }

    // Rango de fechas: $gte = mayor o igual, $lte = menor o igual
    if (dateFrom || dateTo) {
      filter.date = {};

      if (dateFrom) {
        const from = new Date(dateFrom);
        if (Number.isNaN(from.getTime())) throw badRequest('dateFrom no es una fecha válida');
        filter.date.$gte = from;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        if (Number.isNaN(to.getTime())) throw badRequest('dateTo no es una fecha válida');
        filter.date.$lte = to;
      }
    }

    return filter;
  }

  /**
   * Traduce el parametro sort al formato de Mongo.
   *
   *   ?sort=date   -> ascendente  -> { date: 1 }
   *   ?sort=-date  -> descendente -> { date: -1 }
   *
   * Solo se permiten campos de una lista blanca: si aceptaramos
   * cualquier campo, alguien podria ordenar por datos internos.
   */
  #buildSort(sort) {
    if (!sort) return { date: 1 };

    const descending = String(sort).startsWith('-');
    const field = descending ? String(sort).slice(1) : String(sort);

    if (!SORTABLE_FIELDS.includes(field)) {
      throw badRequest(`No se puede ordenar por "${field}". Campos válidos: ${SORTABLE_FIELDS.join(', ')}`);
    }

    return { [field]: descending ? -1 : 1 };
  }

  /**
   * Normaliza page y limit.
   * El limite maximo evita que alguien pida ?limit=999999
   * y tumbe el servidor con una sola peticion.
   */
  #buildPagination({ page, limit }) {
    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);

    return {
      page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      limit:
        Number.isInteger(parsedLimit) && parsedLimit > 0
          ? Math.min(parsedLimit, MAX_LIMIT)
          : DEFAULT_LIMIT,
    };
  }

  

  async updateEvent(eventId, updates, requester) {
    const event = await this.#findAndAuthorize(eventId, requester);

    if (IMMUTABLE_STATUSES.includes(event.status)) {
      throw conflict(`No se puede modificar un evento con estado "${event.status}"`);
    }

    const { organizer, status, ...allowedUpdates } = updates;

    if (allowedUpdates.date !== undefined) this.#validateDate(allowedUpdates.date);
    if (allowedUpdates.capacity !== undefined) this.#validateCapacity(allowedUpdates.capacity);
    if (allowedUpdates.price !== undefined) this.#validatePrice(allowedUpdates.price);

    if (allowedUpdates.category !== undefined) {
      allowedUpdates.category = String(allowedUpdates.category).trim().toLowerCase();
    }

    return this.repository.update(eventId, allowedUpdates);
  }

  async changeStatus(eventId, newStatus, requester) {
    if (!newStatus) {
      throw badRequest('El estado es obligatorio');
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      throw badRequest(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`);
    }

    const event = await this.#findAndAuthorize(eventId, requester);

    if (event.status === newStatus) {
      throw conflict(`El evento ya se encuentra en estado "${newStatus}"`);
    }

    const allowed = ALLOWED_TRANSITIONS[event.status] ?? [];

    if (!allowed.includes(newStatus)) {
      throw conflict(`No se puede pasar de "${event.status}" a "${newStatus}"`);
    }

    return this.repository.update(eventId, { status: newStatus });
  }

  async #findAndAuthorize(eventId, requester) {
    const event = await this.repository.findById(eventId);

    if (!event) {
      throw notFound('Evento no encontrado');
    }

    const isOwner = String(event.organizer) === String(requester.id);
    const isAdmin = requester.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw forbidden('No podés modificar un evento que no te pertenece');
    }

    return event;
  }

  #validateDate(date) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      throw badRequest('La fecha no tiene un formato válido');
    }

    if (parsed.getTime() <= Date.now()) {
      throw badRequest('La fecha del evento debe ser futura');
    }
  }

  #validateCapacity(capacity) {
    if (capacity === undefined) {
      throw badRequest('La capacidad es obligatoria');
    }

    const value = Number(capacity);

    if (Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
      throw badRequest('La capacidad debe ser un número entero mayor a 0');
    }
  }

  #validatePrice(price) {
    if (price === undefined) return;

    const value = Number(price);

    if (Number.isNaN(value) || value < 0) {
      throw badRequest('El precio no puede ser negativo');
    }
  }
}


export const eventsService = new EventsService(eventsRepository);