import test from 'node:test';
import assert from 'node:assert/strict';
import { TicketsService } from '../src/services/tickets.service.js';

// Repositories y mailer falsos: el service corre sin base ni SMTP.
const createFakeTicketsRepo = (overrides = {}) => ({
  create: async (data) => ({ _id: 'tk-1', ...data }),
  findById: async () => null,
  update: async (id, data) => ({ _id: id, ...data }),
  findByUser: async () => [],
  findByEvent: async () => [],
  countOccupiedSeats: async () => 0,
  findActiveByUserAndEvent: async () => null,
  ...overrides,
});

const createFakeEventsRepo = (event) => ({
  findById: async () => event,
});

// El mailer falso registra si lo llamaron, sin mandar nada.
const createFakeMailer = () => {
  const calls = [];
  return {
    calls,
    sendTicketConfirmation: async (args) => {
      calls.push(args);
      return { sent: true };
    },
  };
};

const publishedEvent = {
  _id: 'ev-1',
  title: 'DevConf',
  date: '2030-05-10',
  location: 'Rosario',
  capacity: 10,
  price: 1000,
  status: 'published',
  organizer: 'org-1',
};

const attendee = { id: 'user-1', role: 'user', email: 'ana@mail.com' };

test('createTicket rechaza un evento que no esta publicado', async () => {
  const service = new TicketsService(
    createFakeTicketsRepo(),
    createFakeEventsRepo({ ...publishedEvent, status: 'draft' }),
    createFakeMailer()
  );

  await assert.rejects(
    () => service.createTicket('ev-1', { quantity: 1 }, attendee),
    { statusCode: 409 }
  );
});

test('createTicket rechaza si el usuario ya tiene inscripcion activa', async () => {
  const repository = createFakeTicketsRepo({
    findActiveByUserAndEvent: async () => ({ _id: 'tk-previo', status: 'active' }),
  });
  const service = new TicketsService(
    repository,
    createFakeEventsRepo(publishedEvent),
    createFakeMailer()
  );

  await assert.rejects(
    () => service.createTicket('ev-1', { quantity: 1 }, attendee),
    { statusCode: 409, message: 'Ya tenés una inscripción activa para este evento' }
  );
});

test('createTicket rechaza cuando no alcanza el cupo', async () => {
  // Capacidad 10, ya hay 9 ocupados: solo queda 1.
  const repository = createFakeTicketsRepo({ countOccupiedSeats: async () => 9 });
  const service = new TicketsService(
    repository,
    createFakeEventsRepo(publishedEvent),
    createFakeMailer()
  );

  await assert.rejects(
    () => service.createTicket('ev-1', { quantity: 2 }, attendee),
    { statusCode: 409, message: 'No hay cupo suficiente. Lugares disponibles: 1' }
  );
});

test('createTicket congela el precio y calcula el total', async () => {
  const mailer = createFakeMailer();
  const service = new TicketsService(
    createFakeTicketsRepo(),
    createFakeEventsRepo(publishedEvent),
    mailer
  );

  const ticket = await service.createTicket('ev-1', { quantity: 3 }, attendee);

  assert.equal(ticket.unitPrice, 1000);
  assert.equal(ticket.totalPrice, 3000);
  assert.match(ticket.reservationCode, /^TKT-[0-9A-F]{8}$/);
  assert.equal(mailer.calls.length, 1);              // se envio el mail
  assert.equal(mailer.calls[0].to, 'ana@mail.com');  // al usuario correcto
});

test('cancelTicket marca el ticket como cancelado con su fecha', async () => {
  const repository = createFakeTicketsRepo({
    findById: async () => ({ _id: 'tk-1', user: 'user-1', status: 'active' }),
  });
  const service = new TicketsService(
    repository,
    createFakeEventsRepo(publishedEvent),
    createFakeMailer()
  );

  const cancelled = await service.cancelTicket('tk-1', attendee);

  assert.equal(cancelled.status, 'cancelled');
  assert.ok(cancelled.cancelledAt instanceof Date);
});

test('cancelTicket rechaza cancelar el ticket de otro', async () => {
  const repository = createFakeTicketsRepo({
    findById: async () => ({ _id: 'tk-1', user: 'OTRO-usuario', status: 'active' }),
  });
  const service = new TicketsService(
    repository,
    createFakeEventsRepo(publishedEvent),
    createFakeMailer()
  );

  await assert.rejects(
    () => service.cancelTicket('tk-1', attendee),
    { statusCode: 403 }
  );
});

test('cancelTicket rechaza un ticket ya cancelado', async () => {
  const repository = createFakeTicketsRepo({
    findById: async () => ({ _id: 'tk-1', user: 'user-1', status: 'cancelled' }),
  });
  const service = new TicketsService(
    repository,
    createFakeEventsRepo(publishedEvent),
    createFakeMailer()
  );

  await assert.rejects(
    () => service.cancelTicket('tk-1', attendee),
    { statusCode: 409 }
  );
});

test('getEventTickets rechaza a quien no organiza el evento', async () => {
  const service = new TicketsService(
    createFakeTicketsRepo(),
    createFakeEventsRepo(publishedEvent), // lo organiza 'org-1'
    createFakeMailer()
  );

  await assert.rejects(
    () => service.getEventTickets('ev-1', attendee),
    { statusCode: 403 }
  );
});