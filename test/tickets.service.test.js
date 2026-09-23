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


const createFakeMailer = () => {
  const confirmations = [];
  const cancellations = [];
  return {
    confirmations,
    cancellations,
    sendTicketConfirmation: async (args) => {
      confirmations.push(args);
      return { sent: true };
    },
    sendTicketCancellation: async (args) => {
      cancellations.push(args);
      return { sent: true };
    },
  };
};

const ticketOwner = { _id: 'user-1', email: 'ana@mail.com' };

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

const buildService = ({ repository, event, mailer } = {}) =>
  new TicketsService({
    repository: repository ?? createFakeTicketsRepo(),
    eventsRepository: createFakeEventsRepo(event ?? publishedEvent),
    usersRepository: { findById: async () => ticketOwner },
    mailer: mailer ?? createFakeMailer(),
  });

test('createTicket rechaza un evento que no esta publicado', async () => {
  const service = buildService({ event: { ...publishedEvent, status: 'draft' } });

  await assert.rejects(
    () => service.createTicket('ev-1', { quantity: 1 }, attendee),
    { statusCode: 409 }
  );
});

test('createTicket rechaza si el usuario ya tiene inscripcion activa', async () => {
  const repository = createFakeTicketsRepo({
    findActiveByUserAndEvent: async () => ({ _id: 'tk-previo', status: 'active' }),
  });

const service = buildService({ repository });

  await assert.rejects(
    () => service.createTicket('ev-1', { quantity: 1 }, attendee),
    { statusCode: 409, message: 'Ya tenés una inscripción activa para este evento' }
  );
});

test('createTicket rechaza cuando no alcanza el cupo', async () => {
  // Capacidad 10, ya hay 9 ocupados: solo queda 1.
  const repository = createFakeTicketsRepo({ countOccupiedSeats: async () => 9 });
const service = buildService({ repository });

  await assert.rejects(
    () => service.createTicket('ev-1', { quantity: 2 }, attendee),
    { statusCode: 409, message: 'No hay cupo suficiente. Lugares disponibles: 1' }
  );
});

test('createTicket congela el precio y calcula el total', async () => {
  const mailer = createFakeMailer();
  const service = buildService({ mailer });

  const ticket = await service.createTicket('ev-1', { quantity: 3 }, attendee);

  assert.equal(ticket.unitPrice, 1000);
  assert.equal(ticket.totalPrice, 3000);
  assert.match(ticket.reservationCode, /^TKT-[0-9A-F]{8}$/);
  assert.equal(mailer.confirmations.length, 1);
  assert.equal(mailer.confirmations[0].to, 'ana@mail.com');;  // al usuario correcto
});

test('cancelTicket marca el ticket como cancelado con su fecha', async () => {
  const repository = createFakeTicketsRepo({
    findById: async () => ({ _id: 'tk-1', user: 'user-1', status: 'active' }),
  });
const service = buildService({ repository });

  const cancelled = await service.cancelTicket('tk-1', attendee);

  assert.equal(cancelled.status, 'cancelled');
  assert.ok(cancelled.cancelledAt instanceof Date);
});

test('cancelTicket rechaza cancelar el ticket de otro', async () => {
  const repository = createFakeTicketsRepo({
    findById: async () => ({ _id: 'tk-1', user: 'OTRO-usuario', status: 'active' }),
  });
const service = buildService({ repository });

  await assert.rejects(
    () => service.cancelTicket('tk-1', attendee),
    { statusCode: 403 }
  );
});

test('cancelTicket rechaza un ticket ya cancelado', async () => {
  const repository = createFakeTicketsRepo({
    findById: async () => ({ _id: 'tk-1', user: 'user-1', status: 'cancelled' }),
  });
const service = buildService({ repository });

  await assert.rejects(
    () => service.cancelTicket('tk-1', attendee),
    { statusCode: 409 }
  );
});

test('getEventTickets rechaza a quien no organiza el evento', async () => {
const service = buildService();

  await assert.rejects(
    () => service.getEventTickets('ev-1', attendee),
    { statusCode: 403 }
  );
});

test('cancelTicket avisa por mail al dueño, no a quien cancela', async () => {
  const repository = createFakeTicketsRepo({
    findById: async () => ({
      _id: 'tk-1',
      user: 'user-1',
      event: 'ev-1',
      status: 'active',
      reservationCode: 'TKT-ABCD1234',
    }),
  });
  const mailer = createFakeMailer();
  const service = buildService({ repository, mailer });

  // Un admin cancela el ticket de Ana.
  const admin = { id: 'admin-1', role: 'admin', email: 'admin@mail.com' };
  await service.cancelTicket('tk-1', admin);
  
  assert.equal(mailer.cancellations.length, 1);
  assert.equal(mailer.cancellations[0].to, 'ana@mail.com'); // el dueño
});