const nodemailer = require('nodemailer');

// 1. Configuramos el transportador con GMAIL
const transporter = nodemailer.createTransport({
  service: 'gmail', // Atajo oficial para Gmail
  auth: {
    user: process.env.EMAIL_USER, // conexionanimal2026@gmail.com
    pass: process.env.EMAIL_PASS  // La contraseña de 16 letras (Contraseña de aplicación)
  }
});

const enviarContacto = async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  try {
    await transporter.sendMail({
      // "from" tiene que ser tu propio correo de Gmail
      from: `"Web Conexión Animal" <${process.env.EMAIL_USER}>`, 
      
      // "to" eres tú mismo, para recibir las consultas de los usuarios
      to: process.env.EMAIL_USER, 
      
      // "replyTo" es el email de la persona que escribió en la web.
      // Si le das a "Responder" en Gmail, le contestarás directamente a él.
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
    console.error('Error al enviar el email de contacto (Nodemailer Gmail):', error);
    res.status(500).json({ message: 'Error al enviar el email' });
  }
};

module.exports = { enviarContacto };