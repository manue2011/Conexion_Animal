const { enviarCorreoGmailAPI } = require('../config/mailer');

const enviarContacto = async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  try {
    await enviarCorreoGmailAPI({
      to: process.env.EMAIL_USER, 
      replyTo: email, 
      subject: `Nuevo mensaje de contacto: ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb;">Nuevo mensaje desde la web Conexión Animal</h2>
          <p><strong>👤 Nombre:</strong> ${nombre}</p>
          <p><strong>✉️ Email:</strong> ${email}</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin-top: 15px;">
            <p style="margin: 0;"><strong>Mensaje:</strong></p>
            <p style="margin-top: 10px; white-space: pre-wrap;">${mensaje}</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: 'Email enviado correctamente' });
  } catch (error) {
    console.error('❌ Error en Gmail API (Contacto):', error.message);
    res.status(500).json({ message: 'Error al enviar el email' });
  }
};

module.exports = { enviarContacto };