import express from 'express';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lee las cookies de la peticion y las deja disponibles en req.cookies
app.use(cookieParser());

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;