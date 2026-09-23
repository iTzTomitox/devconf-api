# DevConf API

API REST para una plataforma de **conferencias tech e inscripciones**, desarrollada como proyecto integrador de Programación Backend II.

La plataforma permite publicar conferencias, charlas y meetups, y gestionar las inscripciones de los asistentes con control de cupos, roles y notificaciones.

> **Estado actual: Pre-entrega 7** — inscripciones (`Ticket`) con control de cupos, cancelación que libera lugares y confirmación por email.

---

## Temática

El dominio elegido son las **conferencias tecnológicas**. Un *evento* representa una charla, workshop, meetup o congreso, con categorías como `backend`, `frontend`, `ia`, `cloud`, `devops`, `data` o `security`.

Cada evento tiene un organizador responsable, una fecha, una ubicación, un cupo limitado y un precio (puede ser gratuito). Los usuarios se inscriben generando un *ticket*.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución |
| Express 5 | Framework HTTP y ruteo |
| Mongoose | ODM para MongoDB |
| dotenv | Gestión de variables de entorno |
| ES Modules | Sistema de módulos (`import` / `export`) |
| bcrypt | Hash de contraseñas |
| jsonwebtoken | Generación y verificación de JWT |
| cookie-parser | Lectura de cookies en las peticiones |
| Passport.js | Centralización de estrategias de autenticación |
| passport-local | Estrategia de email y contraseña |
| passport-jwt | Estrategia de verificación de JWT desde cookie |
| Nodemailer | Envío de correos transaccionales (SMTP) |
| Mailtrap | Servidor SMTP de prueba para desarrollo |
| node:test | Corredor de tests nativo de Node |

---

## Requisitos previos

- Node.js 18 o superior
- Una instancia de MongoDB (Atlas o local)

> La API requiere una conexión activa a MongoDB. Si `MONGO_URL` no está configurada o la conexión falla, el servidor no inicia y muestra el error en consola. Esto es intencional: evita que la API quede respondiendo peticiones sin base de datos.

---

## Instalación


```bash
# Clonar el repositorio
git clone https://github.com/iTzTomitox/devconf-api.git

# Entrar al proyecto
cd devconf-api

# Instalar dependencias
npm install
```

---

## Configuración de variables de entorno

Creá un archivo `.env` en la raíz del proyecto tomando como base `.env.example`:

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto donde escucha el servidor | `8080` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `MONGO_URL` | Cadena de conexión a MongoDB Atlas | `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/devconf` |
| `JWT_SECRET` | Clave para firmar los JWT | *(se usa desde la Pre-entrega 3)* |
| `JWT_EXPIRES_IN` | Tiempo de vida del token | `1h` |
| `MAIL_HOST` | Host SMTP | `sandbox.smtp.mailtrap.io` |
| `MAIL_PORT` | Puerto SMTP | `2525` |
| `MAIL_USER` | Usuario SMTP | *(lo provee Mailtrap)* |
| `MAIL_PASS` | Contraseña SMTP | *(lo provee Mailtrap)* |
| `MAIL_FROM` | Remitente de los correos | `DevConf <no-reply@devconf.test>` |

> El archivo `.env` está excluido del repositorio mediante `.gitignore`. Nunca debe subirse.

---

## Cómo ejecutar

```bash
# Modo desarrollo (reinicia al guardar cambios)
npm run dev

# Modo producción
npm start
```

El servidor queda disponible en `http://localhost:8080`.

---

## Tests

El proyecto usa el corredor de tests nativo de Node (`node:test`), sin dependencias externas.

```bash
npm test
```

Los tests cubren las reglas de negocio de los services sin tocar la base de datos ni el servidor SMTP: se les inyectan repositories y un mailer falsos por el constructor, de modo que cada service se ejecuta aislado. Esa es la ventaja concreta de la inyección de dependencias.

| Grupo | Qué valida |
|---|---|
| `createEvent` | Fecha futura obligatoria, normalización de `category` |
| `changeStatus` | Transiciones permitidas, estados inválidos, evento inexistente |
| `updateEvent` | Propiedad del recurso, bypass de `admin`, descarte de `organizer` y `status`, inmutabilidad de eventos cancelados |
| `getEvents` | Tope de `limit`, cálculo de `skip`, lista blanca de `sort` |
| `createTicket` | Evento no publicado, inscripción duplicada, cupo insuficiente, precio congelado y envío de mail |
| `cancelTicket` | Cambio de estado con fecha, propiedad del ticket, doble cancelación |
| `getEventTickets` | Solo el organizador dueño o un `admin` |

## Estructura de carpetas

```
devconf-api/
├── src/
│   ├── app.js                 # Configura Express (no levanta el servidor)
│   ├── server.js              # Punto de entrada: levanta el servidor
│   ├── config/                # Configuración y variables de entorno
│   │   ├── config.js
│   │   ├── db.js
│   │   ├── mailer.js          # Transporte SMTP (Nodemailer)
│   │   └── passport.config.js # Estrategias de autenticación
│   ├── routes/                # Definición de rutas
│   │   ├── index.js           # Router principal
│   │   ├── health.routes.js
│   │   ├── events.routes.js
│   │   ├── sessions.routes.js
│   │   ├── tickets.routes.js
│   │   └── users.routes.js
│   ├── controllers/           # Coordinan request/response
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   ├── sessions.controller.js
│   │   ├── tickets.controller.js
│   │   └── users.controller.js
│   ├── services/              # Lógica de negocio
│   │   ├── events.service.js
│   │   ├── mail.service.js    # Correos transaccionales (best effort)
│   │   ├── sessions.service.js
│   │   └── tickets.service.js
│   ├── repositories/          # Capa intermedia orientada al dominio
│   │   ├── events.repository.js
│   │   ├── tickets.repository.js
│   │   └── users.repository.js
│   ├── dao/                   # Único acceso directo a Mongoose
│   │   ├── events.dao.js
│   │   ├── tickets.dao.js
│   │   └── users.dao.js
│   ├── models/                # Schemas de Mongoose
│   │   ├── user.model.js
│   │   ├── event.model.js
│   │   └── ticket.model.js
│   ├── middlewares/           # Middlewares de Express
│   │   ├── auth.middleware.js       # Autenticación: puebla req.user (401)
│   │   ├── authorize.middleware.js  # Autorización por rol (403)
│   │   └── error.middleware.js
│   └── utils/                 # Funciones auxiliares reutilizables
│       ├── errors.js          # Errores con código HTTP asociado
│       ├── hash.js            # bcrypt: crear y comparar hashes
│       └── jwt.js             # Firma y verificación de JWT
├── test/                      # Tests de reglas de negocio (node:test)
│   ├── events.service.test.js
│   └── tickets.service.test.js
├── .env.example
├── .gitattributes
├── .gitignore
├── package.json
└── README.md
```

### Arquitectura por capas

Cada petición atraviesa una cadena donde cada capa tiene una única responsabilidad:

```
routes → controllers → services → repositories → dao → models
```

- **routes** — asocian una URL con un controller
- **controllers** — leen la request, llaman al service y devuelven la response
- **services** — concentran la lógica de negocio
- **repositories** — exponen métodos orientados al dominio y consumen los DAO
- **dao** — únicos archivos que acceden a Mongoose
- **models** — definen la estructura de los documentos

Regla principal: cada capa solo conoce a la que tiene inmediatamente debajo. Un controller nunca importa un modelo de Mongoose.

### Estrategias de autenticación

La autenticación está centralizada en `src/config/passport.config.js`. Cada estrategia es un punto de entrada que delega la lógica en el service.

| Estrategia | Base | Qué hace |
|---|---|---|
| `register` | passport-local | Recibe los datos del formulario y delega en `sessionsService.register()` |
| `login` | passport-local | Valida credenciales con `sessionsService.validateCredentials()`. **No genera el token** |
| `current` | passport-jwt | Extrae el JWT de la cookie `currentUser` y verifica su firma |

**Reparto de responsabilidades**

```
ruta        -> declara qué estrategia aplicar
estrategia  -> punto de entrada: extrae credenciales y llama al service
service     -> reglas de negocio: valida, hashea, consulta la base
controller  -> transporte HTTP: firma el JWT, setea la cookie, arma la respuesta
```

El **controller**, no la estrategia, es quien genera el JWT y setea la cookie: firmar un token y elegir sus opciones de transporte son decisiones HTTP, no de negocio.

**Preparado para proveedores externos**

Para sumar un login con Google o GitHub alcanza con instalar la estrategia correspondiente, definirla en `passport.config.js` y registrarla en `initializePassport()`. **`app.js` no necesita modificarse**: solo invoca `initializePassport()` y `passport.initialize()`, sin conocer ningún nombre de estrategia.

`src/middlewares/auth.middleware.js` expone un wrapper `authenticate()` que traduce los fallos de Passport al formato de error de la API, para que todas las respuestas mantengan la forma `{ status, message }`.

### Roles y autorización

El sistema distingue **autenticación** (¿quién sos?) de **autorización** (¿qué podés hacer?).

| | Pregunta | Middleware | Falla con |
|---|---|---|---|
| Autenticación | ¿Hay una sesión válida? | `authenticate()` | `401 No autenticado` |
| Autorización | ¿El rol tiene permiso? | `authorize()` | `403 No tenés permisos...` |

> La distinción es deliberada. Un `401` indica que hace falta iniciar sesión; un `403` indica que la sesión es válida pero la cuenta no tiene el permiso necesario. Reintentar solo tiene sentido en el primer caso.

#### Matriz de permisos

| Acción | `user` | `organizer` | `admin` |
|---|:--:|:--:|:--:|
| Consultar eventos | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos **propios** | ❌ | ✅ | ✅ |
| Modificar **cualquier** evento | ❌ | ❌ | ✅ |
| Cambiar el estado de eventos **propios** | ❌ | ✅ | ✅ |
| Inscribirse a un evento | ✅ | ✅ | ✅ |
| Ver **sus propias** inscripciones | ✅ | ✅ | ✅ |
| Cancelar **sus propias** inscripciones | ✅ | ✅ | ✅ |
| Cancelar **cualquier** inscripción | ❌ | ❌ | ✅ |
| Ver inscriptos de eventos **propios** | ❌ | ✅ | ✅ |
| Ver inscriptos de **cualquier** evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

#### Rutas protegidas

| Método | Ruta | Requiere |
|---|---|---|
| `GET` | `/api/events` | — (pública) |
| `GET` | `/api/events/:id` | — (pública) |
| `POST` | `/api/events` | sesión + rol `organizer` o `admin` |
| `PUT` | `/api/events/:id` | sesión + rol `organizer` o `admin` + **ser dueño del evento** (o `admin`) |
| `PATCH` | `/api/events/:id/status` | sesión + rol `organizer` o `admin` + **ser dueño del evento** (o `admin`) |
| `POST` | `/api/events/:eid/tickets` | sesión |
| `GET` | `/api/events/:eid/tickets` | sesión + **ser dueño del evento** (o `admin`) |
| `GET` | `/api/tickets/my-tickets` | sesión |
| `PATCH` | `/api/tickets/:tid/cancel` | sesión + **ser dueño del ticket** (o `admin`) |
| `GET` | `/api/sessions/current` | sesión |
| `GET` | `/api/users` | sesión + rol `admin` |

#### Dos niveles de control

**Por rol** — se resuelve en el middleware `authorize()`, que compara `req.user.role` contra la lista de roles permitidos. No necesita consultar la base.

**Por propiedad del recurso** — vive en el **service**, no en un middleware. Para saber si un evento te pertenece hay que buscarlo primero en la base y comparar su campo `organizer` con el id del usuario autenticado. Eso es una regla de negocio.

```js
// events.service.js - updateEvent()
const isOwner = String(event.organizer) === String(requester.id);
const isAdmin = requester.role === 'admin';
if (!isOwner && !isAdmin) throw forbidden('...');
```

Un `PUT /api/events/:id` atraviesa tres controles: sesión (`401`), rol (`403`) y propiedad (`403` o `404` si el evento no existe).

#### Asignación de roles

El registro público **siempre** crea usuarios con rol `user`: el campo `role` se ignora si viene en el body. Los roles `organizer` y `admin` se asignan manualmente en la base de datos.

---

## Rutas disponibles

### Health

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Verifica que el servidor está activo |

**Respuesta `200`**

```json
{ "status": "ok", "message": "Servidor activo" }
```

### Eventos

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/events` | Público |
| `GET` | `/api/events/:id` | Público |
| `POST` | `/api/events` | `organizer` o `admin` |
| `PUT` | `/api/events/:id` | Dueño del evento o `admin` |
| `PATCH` | `/api/events/:id/status` | Dueño del evento o `admin` |

#### `GET /api/events`

Listado público con filtros, paginación y ordenamiento.

**Query params**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `status` | string | — | Filtra por estado exacto |
| `category` | string | — | Filtra por categoría (insensible a mayúsculas) |
| `location` | string | — | Coincidencia parcial, insensible a mayúsculas |
| `dateFrom` | fecha | — | Eventos desde esta fecha inclusive |
| `dateTo` | fecha | — | Eventos hasta esta fecha inclusive |
| `page` | número | `1` | Página solicitada |
| `limit` | número | `10` | Resultados por página (máximo `50`) |
| `sort` | string | `date` | `date`, `price`, `title`, `createdAt`. Prefijo `-` para descendente |

**Ejemplo**

```
GET /api/events?status=published&location=buenos&page=1&limit=5&sort=-date
```

**Respuesta `200`**

```json
{
  "status": "success",
  "data": [],
  "page": 1,
  "limit": 5,
  "total": 12,
  "totalPages": 3
}
```

**Errores**

| Código | Situación | Mensaje |
|---|---|---|
| `400` | `status` no válido | `Estado inválido. Valores permitidos: ...` |
| `400` | `sort` sobre un campo no permitido | `No se puede ordenar por "X". Campos válidos: ...` |
| `400` | `dateFrom` o `dateTo` mal formadas | `dateFrom no es una fecha válida` |

#### `POST /api/events`

**Campos**

| Campo | Obligatorio |
|---|:--:|
| `title` | ✅ |
| `description` | ✅ |
| `category` | ✅ |
| `date` | ✅ |
| `location` | ✅ |
| `capacity` | ✅ |
| `price` | ❌ |

> El campo `organizer` **no se acepta desde el body**: se asigna automáticamente desde el usuario autenticado.

> Las reglas de negocio se validan en el service: la fecha debe ser futura, `capacity` un entero mayor a 0, y `price` no puede ser negativo. Todo evento nace con `status: "draft"` y la `category` se normaliza a minúsculas.

**Request**

```json
{
  "title": "Congreso Backend 2026",
  "description": "Charlas sobre arquitectura y APIs",
  "category": "backend",
  "date": "2026-12-01",
  "location": "Buenos Aires",
  "capacity": 100,
  "price": 0
}
```

**Respuesta `201 Created`**

```json
{
  "status": "success",
  "payload": {
    "_id": "6a96cf009a0743818d17094d",
    "title": "Congreso Backend 2026",
    "category": "backend",
    "status": "draft",
    "organizer": "6a96cd276006139b0547efa8"
  }
}
```

**Errores**

| Código | Situación | Mensaje |
|---|---|---|
| `400` | Faltan campos obligatorios | `Faltan campos obligatorios` |
| `400` | Fecha pasada o inválida | `La fecha del evento debe ser futura` |
| `400` | Capacidad no válida | `La capacidad debe ser un número entero mayor a 0` |
| `400` | Precio negativo | `El precio no puede ser negativo` |
| `401` | Sin sesión | `No autenticado` |
| `403` | Rol `user` | `No tenés permisos para realizar esta acción` |

#### `PUT /api/events/:id`

Actualiza un evento. Solo el organizador dueño o un `admin`.

**Errores**

| Código | Situación | Mensaje |
|---|---|---|
| `401` | Sin sesión | `No autenticado` |
| `403` | Rol sin permiso | `No tenés permisos para realizar esta acción` |
| `403` | Evento de otro organizador | `No podés modificar un evento que no te pertenece` |
| `404` | El evento no existe | `Evento no encontrado` |
| `409` | Evento `cancelled` o `finished` | `No se puede modificar un evento con estado "X"` |

> El campo `organizer` se descarta si viene en el body: un evento no puede transferirse a otro usuario.

> El campo `status` también se descarta del body: los cambios de estado van por `PATCH /api/events/:id/status`.

#### `PATCH /api/events/:id/status`

Cambia el estado de un evento. Se usa `PATCH` y no `PUT` porque modifica un único campo, no el recurso completo.

**Request**

```json
{ "status": "published" }
```

**Máquina de estados**

| Estado actual | Transiciones permitidas |
|---|---|
| `draft` | `published`, `cancelled` |
| `published` | `cancelled`, `finished` |
| `cancelled` | — (terminal) |
| `finished` | — (terminal) |

Un evento nace en `draft`. Una vez en `cancelled` o `finished` no admite más cambios de estado ni ediciones por `PUT`.

**Respuesta `200`**

```json
{
  "status": "success",
  "payload": {
    "_id": "6a9a2a0d91ede52ca64f8217",
    "title": "DevConf Buenos Aires 2027",
    "status": "published"
  }
}
```

**Errores**

| Código | Situación | Mensaje |
|---|---|---|
| `400` | Falta el campo `status` | `El estado es obligatorio` |
| `400` | Estado inexistente | `Estado inválido. Valores permitidos: ...` |
| `401` | Sin sesión | `No autenticado` |
| `403` | Rol sin permiso | `No tenés permisos para realizar esta acción` |
| `403` | Evento de otro organizador | `No podés modificar un evento que no te pertenece` |
| `404` | El evento no existe | `Evento no encontrado` |
| `409` | Ya está en ese estado | `El evento ya se encuentra en estado "X"` |
| `409` | Transición no permitida | `No se puede pasar de "X" a "Y"` |

### Tickets

Un **ticket** es la inscripción de un usuario a un evento.

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/events/:eid/tickets` | Cualquier usuario autenticado |
| `GET` | `/api/events/:eid/tickets` | Organizador dueño del evento o `admin` |
| `GET` | `/api/tickets/my-tickets` | Cualquier usuario autenticado |
| `PATCH` | `/api/tickets/:tid/cancel` | Dueño del ticket o `admin` |

#### Reglas de cupo

Los lugares ocupados de un evento se calculan como la **suma de `quantity` de todos sus tickets no cancelados**, mediante una agregación en MongoDB:

```
disponibles = event.capacity - SUMA(quantity de tickets con status != 'cancelled')
```

De ahí se desprenden tres consecuencias:

- Cancelar un ticket **libera el cupo automáticamente**: no hay que devolver lugares en ningún lado, el ticket cancelado deja de contar en la suma.
- Un ticket cancelado **no bloquea una inscripción nueva**: el control de duplicados busca solo tickets `active`.
- Un usuario puede tener **una sola inscripción activa por evento**, con la cantidad de entradas que quiera dentro del cupo disponible.

#### `POST /api/events/:eid/tickets`

**Request**

```json
{ "quantity": 2 }
```

`quantity` es opcional: si no viene, se asume `1`.

**Respuesta `201 Created`**

```json
{
  "status": "success",
  "payload": {
    "reservationCode": "TKT-DFF85D0D",
    "user": "6aae182519000cb6b1be10a9",
    "event": "6aae18b519000cb6b1be10aa",
    "quantity": 2,
    "unitPrice": 1000,
    "totalPrice": 2000,
    "status": "active",
    "cancelledAt": null
  }
}
```

> `unitPrice` y `totalPrice` quedan congelados al momento de la compra: si el organizador cambia el precio del evento después, los tickets ya emitidos conservan lo que se cobró.

Al confirmar la inscripción se envía un correo con el código del ticket. El envío es *best effort*: si el servidor SMTP falla, se registra en consola pero la inscripción sigue siendo válida.

**Errores**

| Código | Situación | Mensaje |
|---|---|---|
| `400` | `quantity` inválida | `La cantidad debe ser un número entero mayor o igual a 1` |
| `401` | Sin sesión | `No autenticado` |
| `404` | El evento no existe | `Evento no encontrado` |
| `409` | Evento no publicado | `Solo se puede reservar en eventos publicados` |
| `409` | Evento ya ocurrido | `El evento ya ocurrió` |
| `409` | Ya tiene inscripción activa | `Ya tenés una inscripción activa para este evento` |
| `409` | Cupo insuficiente | `No hay cupo suficiente. Lugares disponibles: N` |

#### `GET /api/tickets/my-tickets`

Inscripciones del usuario autenticado, de la más reciente a la más antigua. El campo `event` viene resuelto con `populate` (`title`, `date`, `location`, `status`) en lugar de un id suelto.

#### `GET /api/events/:eid/tickets`

Listado de inscriptos de un evento, con el campo `user` resuelto (`first_name`, `last_name`, `email`).

| Código | Situación | Mensaje |
|---|---|---|
| `401` | Sin sesión | `No autenticado` |
| `403` | No organiza el evento | `No podés ver los inscriptos de un evento que no te pertenece` |
| `404` | El evento no existe | `Evento no encontrado` |

#### `PATCH /api/tickets/:tid/cancel`

Cancelación lógica: el ticket no se elimina, pasa a `status: "cancelled"` y se registra `cancelledAt`. Así queda el historial y el cupo se libera solo.

| Código | Situación | Mensaje |
|---|---|---|
| `401` | Sin sesión | `No autenticado` |
| `403` | El ticket es de otro usuario | `No podés cancelar una inscripción que no te pertenece` |
| `404` | El ticket no existe | `Ticket no encontrado` |
| `409` | Ya estaba cancelado | `La inscripción ya estaba cancelada` |

### Usuarios

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/users` | Solo `admin` |

**Respuesta `200 OK`** — ningún usuario incluye el campo `password`.

```json
{
  "status": "success",
  "payload": [
    { "id": "...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" }
  ]
}
```

**Errores**

| Código | Situación |
|---|---|
| `401` | Sin sesión |
| `403` | Rol distinto de `admin` |

### Sesiones

#### `POST /api/sessions/register`

Registra un usuario nuevo. La contraseña se almacena hasheada con bcrypt y nunca se devuelve en la respuesta.

**Campos esperados** (todos obligatorios)

| Campo | Tipo | Validación |
|---|---|---|
| `first_name` | string | No puede estar vacío |
| `last_name` | string | No puede estar vacío |
| `email` | string | Formato válido. Se normaliza a minúsculas y sin espacios |
| `password` | string | Mínimo 8 caracteres |

> El campo `role` **no se acepta desde el body**. Todo usuario registrado por esta vía se crea con rol `user`.

**Request**

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com",
  "password": "Secreta123"
}
```

**Respuesta `201 Created`**

```json
{
  "status": "success",
  "payload": {
    "id": "6a748ecd42da2389ff97a63d",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

**Respuestas de error**

| Código | Situación | Mensaje |
|---|---|---|
| `400` | Faltan campos obligatorios | `Faltan campos obligatorios` |
| `400` | Email mal formado | `El formato del email no es válido` |
| `400` | Contraseña muy corta | `La contraseña debe tener al menos 8 caracteres` |
| `409` | Email ya registrado | `El email ya está registrado` |

#### `POST /api/sessions/login`

Valida credenciales y devuelve una cookie de sesión con el JWT.

**Campos esperados**

| Campo | Tipo |
|---|---|
| `email` | string |
| `password` | string |

**Request**

```json
{ "email": "ana@mail.com", "password": "Secreta123" }
```

**Respuesta `200 OK`**

Además del cuerpo, la respuesta incluye la cabecera `Set-Cookie` con la cookie `currentUser` marcada como `HttpOnly`.

```json
{ "status": "success", "message": "Login correcto" }
```

> El token **no** se devuelve en el cuerpo. Viaja únicamente en la cookie, que es inaccesible desde JavaScript.

**Respuestas de error**

| Código | Situación | Mensaje |
|---|---|---|
| `400` | Falta `email` o `password` | `Faltan campos obligatorios` |
| `401` | Email inexistente **o** contraseña incorrecta | `Credenciales inválidas` |

> El mensaje es idéntico en ambos casos de forma deliberada: distinguirlos permitiría averiguar qué emails están registrados en el sistema.

#### `GET /api/sessions/current`

Devuelve los datos del usuario autenticado. **Requiere sesión activa.**

No recibe parámetros: la identidad se obtiene del JWT que viaja en la cookie `currentUser`, enviada automáticamente por el cliente.

**Respuesta `200 OK`**

```json
{
  "status": "success",
  "payload": {
    "id": "6a748ecd42da2389ff97a63d",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

**Respuesta `401 Unauthorized`**

Cuando no hay cookie, o el token está expirado o fue manipulado.

```json
{ "status": "error", "message": "No autenticado" }
```

#### `POST /api/sessions/logout`

Elimina la cookie de sesión. No requiere cuerpo.

**Respuesta `200 OK`**

```json
{ "status": "success", "message": "Sesión cerrada" }
```

---

### Flujo de autenticación

```
POST /register  ->  crea el usuario con la password hasheada (bcrypt)
       |
POST /login     ->  verifica credenciales
                    firma un JWT { id, email, role }
                    lo guarda en la cookie currentUser (HttpOnly)
       |
GET /current    ->  authMiddleware lee la cookie
                    verifica la firma del JWT
                    deja el payload en req.user
       |
POST /logout    ->  borra la cookie -> /current vuelve a dar 401
```

**Decisiones de seguridad**

| Decisión | Motivo |
|---|---|
| Cookie `httpOnly` | JavaScript no puede leer el token, ni siquiera ante un XSS |
| Cookie `sameSite: 'lax'` | El navegador no la envía en peticiones desde otros sitios (CSRF) |
| `secure` solo en producción | Obliga HTTPS en producción; en desarrollo permite `http://localhost` |
| Mensaje de login genérico | Evita revelar qué emails están registrados |
| Payload mínimo en el JWT | El contenido de un JWT es legible por cualquiera: solo va lo imprescindible |
| Expiración de 1 hora | Como el servidor no guarda estado, no puede revocar tokens: la expiración limita el daño si uno se filtra |

### Manejo de errores

Un middleware centralizado unifica el formato de todas las respuestas de error.

**Ruta inexistente — `404`**

```json
{ "status": "error", "message": "Ruta no encontrada: GET /api/cualquier-cosa" }
```

**Códigos utilizados**

| Código | Significado |
|---|---|
| `200` | Petición exitosa |  
| `201` | Recurso creado |
| `400` | Datos inválidos o incompletos |
| `403` | Autenticado, pero sin permisos para esta acción |
| `404` | Recurso o ruta inexistente |
| `409` | Conflicto con el estado actual (ej. email duplicado) |
| `500` | Error interno del servidor |
| `501` | Funcionalidad aún no implementada |

---

## Autor

**Tomás Berón** — Programación Backend II