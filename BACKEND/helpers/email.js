import sgMail from '@sendgrid/mail';
import 'dotenv/config';

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("❌ Errore invio email:", error.message);
    if (error.response) {
      console.error("📩 Response error:", error.response.body);
    }
    throw new Error("Errore nell'invio dell'email");
  }
};
