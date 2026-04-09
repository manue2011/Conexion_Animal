const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const enviarContacto = async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  const msg = {
    to: 'conexionanimal2026@outlook.com', // El tuyo
    from: 'conexionanimal2026@outlook.com', // El verificado en SendGrid
    replyTo: email,
    subject: `Nuevo mensaje de contacto: ${nombre}`,
    html: `
      <h2>Nuevo mensaje desde la web Conexión Animal</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong> ${mensaje}</p>
    `,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: 'Email enviado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el email' });
  }
};

module.exports = { enviarContacto };