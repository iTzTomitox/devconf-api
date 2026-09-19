import nodemailer from 'nodemailer';
import { config } from './config.js';

export const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

export const isMailConfigured = () =>
  Boolean(config.mail.host && config.mail.user && config.mail.pass);