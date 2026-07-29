# DevConf API

API REST para una plataforma de **conferencias tech e inscripciones**, desarrollada como proyecto integrador de Programación Backend II.

La plataforma permite publicar conferencias, charlas y meetups, y gestionar las inscripciones de los asistentes con control de cupos, roles y notificaciones.

> **Estado actual: Pre-entrega 1** — estructura base de la API organizada por capas. La lógica de autenticación, eventos e inscripciones se incorpora en las siguientes entregas.

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

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/USUARIO/devconf-api.git

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
| `MONGO_URL` | Cadena de conexión a MongoDB | *(vacío en esta entrega)* |
| `JWT_SECRET` | Clave para firmar los JWT | *(se usa desde la Pre-entrega 3)* |

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
│   │   └── events.service.js
│   ├── repositories/          # Capa intermedia orientada al dominio
│   │   └── events.repository.js
│   ├── dao/                   # Único acceso directo a Mongoose
│   │   └── events.dao.js
│   ├── models/                # Schemas de Mongoose
│   │   ├── user.model.js
│   │   └── event.model.js
│   ├── middlewares/           # Middlewares de Express
│   │   └── error.middleware.js
│   └── utils/                 # Funciones auxiliares reutilizables
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
- **controllers** — leen la request,