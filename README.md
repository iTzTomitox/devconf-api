# DevConf API

API REST para una plataforma de **conferencias tech e inscripciones**, desarrollada como proyecto integrador de Programación Backend II.

La plataforma permite publicar conferencias, charlas y meetups, y gestionar las inscripciones de los asistentes con control de cupos, roles y notificaciones.

> **Estado actual: Pre-entrega 3** — autenticación completa con JWT almacenado en cookie HTTP Only.

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

## Estructura de carpetas

```
devconf-api/
├── src/
│   ├── app.js                 # Configura Express (no levanta el servidor)
│   ├── server.js              # Punto de entrada: levanta el servidor
│   ├── config/                # Configuración y variables de entorno
│   │   └── config.js
│   ├── routes/                # Definición de rutas
│   │   ├── index.js           # Router principal
│   │   ├── health.routes.js
│   │   ├── events.routes.js
│   │   └── sessions.routes.js
│   ├── controllers/           # Coordinan request/response
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── services/              # Lógica de negocio
│   │   ├── events.service.js
│   │   └── sessions.service.js
│   ├── repositories/          # Capa intermedia orientada al dominio
│   │   ├── events.repository.js
│   │   └── users.repository.js
│   ├── dao/                   # Único acceso directo a Mongoose
│   │   ├── events.dao.js
│   │   └── users.dao.js
│   ├── models/                # Schemas de Mongoose
│   │   ├── user.model.js
│   │   └── event.model.js
│   ├── middlewares/           # Middlewares de Express
│   │   └── error.middleware.js
│   └── utils/                 # Funciones auxiliares reutilizables
│       ├── errors.js          # Errores con código HTTP asociado
│       └── hash.js            # bcrypt: crear y comparar hashes
├── .env.example
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

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/events` | Lista los eventos almacenados en la base |

**Respuesta `200`** (array vacío mientras no haya eventos cargados)

```json
{ "status": "success", "payload": [] }
```

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
| `404` | Recurso o ruta inexistente |
| `409` | Conflicto con el estado actual (ej. email duplicado) |
| `500` | Error interno del servidor |
| `501` | Funcionalidad aún no implementada |

---

## Autor

**Tomás Berón** — Programación Backend II