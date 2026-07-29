// src/app.js
import express from 'express';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

// Estos dos van SIEMPRE al final, en este orden
app.use(notFoundHandler);
app.use(errorHandler);

export default app;