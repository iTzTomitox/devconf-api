import { transporter, isMailConfigured } from '../config/mailer.js';
import { config } from '../config/config.js';

class MailService {
  async sendTicketConfirmation({ to, ticket, event }) {
    if (!isMailConfigured()) {
      console.warn('[mail] Credenciales no configuradas, se omite el envio');
      return { sent: false, reason: 'not-configured' };
    }

    
    const eventDate = new Date(event.date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    

    try {
      const info = await transporter.sendMail({
        from: config.mail.from,
        to,
        subject: `Inscripción confirmada: ${event.title}`,
        html: `
          <h2>¡Tu inscripción está confirmada!</h2>
          <p>Guardá este código, te lo van a pedir en el ingreso:</p>
          <p style="font-size:20px;font-weight:bold;">${ticket.code}</p>
          <hr>
          <p><strong>Evento:</strong> ${event.title}</p>
          <p><strong>Fecha:</strong> ${eventDate}</p>
          <p><strong>Lugar:</strong> ${event.location}</p>
          <p><strong>Entradas:</strong> ${ticket.quantity}</p>
          <p><strong>Total:</strong> $${ticket.totalPrice}</p>
          <hr>
          <p style="color:#888;font-size:12px;">DevConf API — mail automático, no responder.</p>
        `,
      });

    const eventDate = new Date(event.date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

      return { sent: true, messageId: info.messageId };
    } catch (error) {
      console.error('[mail] Error al enviar la confirmación:', error.message);
      return { sent: false, reason: error.message };
    }
  }
}


export const mailService = new MailService();