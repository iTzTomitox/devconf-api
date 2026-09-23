import { transporter, isMailConfigured } from '../config/mailer.js';
import { config } from '../config/config.js';

class MailService {
  async sendTicketConfirmation({ to, ticket, event }) {
    return this.#send({
      to,
      subject: `Inscripción confirmada: ${event.title}`,
      html: `
        <h2>¡Tu inscripción está confirmada!</h2>
        <p>Guardá este código, te lo van a pedir en el ingreso:</p>
        <p style="font-size:20px;font-weight:bold;">${ticket.reservationCode}</p>
        <hr>
        <p><strong>Evento:</strong> ${event.title}</p>
        <p><strong>Fecha:</strong> ${this.#formatDate(event.date)}</p>
        <p><strong>Lugar:</strong> ${event.location}</p>
        <p><strong>Entradas:</strong> ${ticket.quantity}</p>
        <p><strong>Total:</strong> $${ticket.totalPrice}</p>
        ${this.#footer()}
      `,
      context: 'confirmación',
    });
  }

  async sendTicketCancellation({ to, ticket, event }) {
    return this.#send({
      to,
      subject: `Inscripción cancelada: ${event.title}`,
      html: `
        <h2>Tu inscripción fue cancelada</h2>
        <p>El código <strong>${ticket.reservationCode}</strong> ya no es válido para el ingreso.</p>
        <hr>
        <p><strong>Evento:</strong> ${event.title}</p>
        <p><strong>Fecha:</strong> ${this.#formatDate(event.date)}</p>
        <p><strong>Lugar:</strong> ${event.location}</p>
        <p><strong>Entradas liberadas:</strong> ${ticket.quantity}</p>
        <p>Si te arrepentís, podés volver a inscribirte mientras haya cupo.</p>
        ${this.#footer()}
      `,
      context: 'cancelación',
    });
  }

  async #send({ to, subject, html, context }) {
    if (!isMailConfigured()) {
      console.warn('[mail] Credenciales no configuradas, se omite el envio');
      return { sent: false, reason: 'not-configured' };
    }

    try {
      const info = await transporter.sendMail({
        from: config.mail.from,
        to,
        subject,
        html,
      });

      return { sent: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[mail] Error al enviar la ${context}:`, error.message);
      return { sent: false, reason: error.message };
    }
  }

  #formatDate(date) {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  #footer() {
    return `
      <hr>
      <p style="color:#888;font-size:12px;">DevConf API — mail automático, no responder.</p>
    `;
  }
}

export const mailService = new MailService();