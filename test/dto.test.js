import test from 'node:test';
import assert from 'node:assert/strict';
import { toUserDTO, toUserListDTO } from '../src/dto/user.dto.js';
import { toEventDTO } from '../src/dto/event.dto.js';
import { toTicketDTO } from '../src/dto/ticket.dto.js';

// Documento tal como sale de Mongo, con todo lo que NO debe salir.
const userDoc = {
  _id: 'u-1',
  first_name: 'Ana',
  last_name: 'Lopez',
  email: 'ana@mail.com',
  password: '$2b$10$hashquenuncadebesalir',
  role: 'user',
  __v: 0,
};

test('toUserDTO no expone la password ni campos internos', () => {
  const dto = toUserDTO(userDoc);

  assert.equal(dto.password, undefined);
  assert.equal(dto.__v, undefined);
  assert.equal(dto._id, undefined);
  assert.equal(dto.id, 'u-1');
  assert.deepEqual(Object.keys(dto).sort(), [
    'email',
    'first_name',
    'id',
    'last_name',
    'role',
  ]);
});

test('toUserDTO omite los campos que no vinieron', () => {
  // El payload del JWT solo trae id, email y role.
  const dto = toUserDTO({ id: 'u-1', email: 'ana@mail.com', role: 'user' });

  assert.deepEqual(Object.keys(dto).sort(), ['email', 'id', 'role']);
});

test('toUserListDTO limpia toda la lista', () => {
  const dtos = toUserListDTO([userDoc, { ...userDoc, _id: 'u-2' }]);

  assert.equal(dtos.length, 2);
  assert.ok(dtos.every((dto) => dto.password === undefined));
});

test('toEventDTO calcula los lugares disponibles', () => {
  const dto = toEventDTO({
    _id: 'ev-1',
    title: 'DevConf',
    capacity: 10,
    seatsTaken: 4,
    status: 'published',
    organizer: 'org-1',
    __v: 0,
  });

  assert.equal(dto.availableSeats, 6);
  assert.equal(dto.__v, undefined);
  assert.equal(dto.organizer, 'org-1'); // ref sin populate: queda como string
});

test('toTicketDTO no expone la password del usuario populado', () => {
  const dto = toTicketDTO({
    _id: 'tk-1',
    reservationCode: 'TKT-ABCD1234',
    user: userDoc,          // populado, CON password
    event: 'ev-1',          // sin populate
    quantity: 2,
    unitPrice: 1000,
    totalPrice: 2000,
    status: 'active',
    __v: 0,
  });

  assert.equal(dto.user.password, undefined);
  assert.equal(dto.user.email, 'ana@mail.com');
  assert.equal(dto.event, 'ev-1');
  assert.equal(dto.__v, undefined);
});