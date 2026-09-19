import test from 'node:test';
import assert from 'node:assert/strict';
import { EventsService } from '../src/services/events.service.js';

/**
 * Repository falso ("doble de prueba").
 *
 * No toca MongoDB: devuelve lo que le digamos y guarda con qué
 * argumentos lo llamaron, para poder revisarlo despues.
 *
 * El service no sabe ni le importa que este no sea el real: solo
 * necesita un objeto con los metodos que usa. Eso es posible
 * porque el repository entra por el constructor.
 */
const createFakeRepository = (overrides = {}) => ({
  findById: async () => null,
  create: async (data) => ({ _id: 'fake-id', ...data }),
  update: async (id, data) => ({ _id: id, ...data }),
  paginate: async () => ({ documents: [], total: 0 }),
  ...overrides,
});

const organizer = { id: 'user-1', role: 'organizer' };

const validEventData = {
  title: 'DevConf 2030',
  description: 'Conferencia de prueba',
  category: 'Backend',
  date: '2030-05-10',
  location: 'Buenos Aires',
  capacity: 100,
  price: 5000,
};

test('createEvent rechaza una fecha pasada', async () => {
  const service = new EventsService(createFakeRepository());

  // assert.rejects espera que la promesa falle, y valida el error.
  await assert.rejects(
    () => service.createEvent({ ...validEventData, date: '2020-01-01' }, organizer),
    { statusCode: 400, message: 'La fecha del evento debe ser futura' }
  );
});

test('createEvent normaliza la categoria a minusculas', async () => {
  const service = new EventsService(createFakeRepository());

  const created = await service.createEvent(validEventData, organizer);

  assert.equal(created.category, 'backend');
});

test('changeStatus permite pasar de draft a published', async () => {
  // Este repository falso devuelve un evento en draft cuyo dueño
  // es nuestro organizador.
  const repository = createFakeRepository({
    findById: async () => ({ _id: 'ev-1', status: 'draft', organizer: 'user-1' }),
  });
  const service = new EventsService(repository);

  const updated = await service.changeStatus('ev-1', 'published', organizer);

  assert.equal(updated.status, 'published');
});

test('changeStatus rechaza volver de published a draft', async () => {
  const repository = createFakeRepository({
    findById: async () => ({ _id: 'ev-1', status: 'published', organizer: 'user-1' }),
  });
  const service = new EventsService(repository);

  await assert.rejects(
    () => service.changeStatus('ev-1', 'draft', organizer),
    { statusCode: 409 }
  );
});

test('changeStatus rechaza un estado inexistente', async () => {
  const service = new EventsService(createFakeRepository());

  await assert.rejects(
    () => service.changeStatus('ev-1', 'archivado', organizer),
    { statusCode: 400 }
  );
});

test('changeStatus rechaza si el evento no existe', async () => {
  // findById devuelve null: el evento no está en la base.
  const service = new EventsService(createFakeRepository());

  await assert.rejects(
    () => service.changeStatus('ev-inexistente', 'published', organizer),
    { statusCode: 404 }
  );
});

test('un organizador no puede modificar el evento de otro', async () => {
  const repository = createFakeRepository({
    findById: async () => ({ _id: 'ev-1', status: 'draft', organizer: 'OTRO-usuario' }),
  });
  const service = new EventsService(repository);

  await assert.rejects(
    () => service.updateEvent('ev-1', { title: 'Robado' }, organizer),
    { statusCode: 403 }
  );
});

test('un admin si puede modificar el evento de otro', async () => {
  const repository = createFakeRepository({
    findById: async () => ({ _id: 'ev-1', status: 'draft', organizer: 'OTRO-usuario' }),
  });
  const service = new EventsService(repository);
  const admin = { id: 'admin-1', role: 'admin' };

  const updated = await service.updateEvent('ev-1', { title: 'Corregido' }, admin);

  assert.equal(updated.title, 'Corregido');
});

test('updateEvent descarta organizer y status del body', async () => {
  const repository = createFakeRepository({
    findById: async () => ({ _id: 'ev-1', status: 'draft', organizer: 'user-1' }),
  });
  const service = new EventsService(repository);

  const updated = await service.updateEvent(
    'ev-1',
    { title: 'Nuevo', organizer: 'usurpador', status: 'published' },
    organizer
  );

  // Si el mass assignment estuviera abierto, estos dos campos
  // habrían llegado al repository.
  assert.equal(updated.organizer, undefined);
  assert.equal(updated.status, undefined);
});

test('un evento cancelado no se puede modificar', async () => {
  const repository = createFakeRepository({
    findById: async () => ({ _id: 'ev-1', status: 'cancelled', organizer: 'user-1' }),
  });
  const service = new EventsService(repository);

  await assert.rejects(
    () => service.updateEvent('ev-1', { title: 'Nuevo' }, organizer),
    { statusCode: 409 }
  );
});

test('getEvents aplica el tope de limit', async () => {
  // Capturamos las opciones con las que el service llama al repository.
  let capturedOptions;
  const repository = createFakeRepository({
    paginate: async (filter, options) => {
      capturedOptions = options;
      return { documents: [], total: 0 };
    },
  });
  const service = new EventsService(repository);

  const result = await service.getEvents({ limit: '99999' });

  assert.equal(capturedOptions.limit, 50);
  assert.equal(result.limit, 50);
});

test('getEvents calcula bien el skip de la pagina 3', async () => {
  let capturedOptions;
  const repository = createFakeRepository({
    paginate: async (filter, options) => {
      capturedOptions = options;
      return { documents: [], total: 0 };
    },
  });
  const service = new EventsService(repository);

  await service.getEvents({ page: '3', limit: '10' });

  assert.equal(capturedOptions.skip, 20); // (3 - 1) * 10
});

test('getEvents rechaza ordenar por un campo no permitido', async () => {
  const service = new EventsService(createFakeRepository());

  await assert.rejects(
    () => service.getEvents({ sort: 'password' }),
    { statusCode: 400 }
  );
});