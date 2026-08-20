import express from 'express';
import cookieParser from 'cookie-parser';
import passport, { initializePassport } from './config/passport.config.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;