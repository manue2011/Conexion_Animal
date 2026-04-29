const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '74.125.133.108',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    servername: 'smtp.gmail.com'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP ERROR:', error.message, '| Código:', error.code);
  } else {
    console.log('✅ SMTP conectado correctamente con:', process.env.EMAIL_USER);
  }
});


const enviarContacto = async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  try {
    await transporter.sendMail({
      from: `"Web Conexión Animal" <${process.env.EMAIL_USER}>`, 
      
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
    console.error('❌ Error Nodemailer:');
  console.error('   mensaje:', error.message);
  console.error('   código:', error.code);
  console.error('   respuesta SMTP:', error.response);
  res.status(500).json({ message: 'Error al enviar el email' });

  }
};

module.exports = { enviarContacto };