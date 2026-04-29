const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const validator = require('validator');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');

// 1. Configuramos Nodemailer para GMAIL (Igual que en tus necesidades)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Utilidades de validación y seguridad
const validarDominioReal = async (email) => {
  const dominio = email.split('@')[1];
  try {
    const records = await dns.resolveMx(dominio);
    return records && records.length > 0;
  } catch (err) {
    return false;
  }
};

const verifyRecaptcha = async (token) => {
  try {
    const params = new URLSearchParams();
    params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
    params.append('response', token);

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      params
    );
    return response.data;
  } catch (error) {
    console.error('Error conectando con Google reCAPTCHA:', error.message);
    return { success: false };
  }
};

// Función para generar un PIN de 6 dígitos aleatorio
const generatePIN = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const register = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  try {
    // --- SEGURIDAD 1: reCAPTCHA ---
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'No se recibió el token de seguridad' });
    }
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res.status(400).json({ message: 'Verificación de seguridad fallida.' });
    }

    // --- SEGURIDAD 2: VALIDACIÓN DE FORMATO ---
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'El formato del correo no es válido.' });
    }

    // --- SEGURIDAD 3: NORMALIZACIÓN ---
    const emailLimpio = validator.normalizeEmail(email);

    // --- SEGURIDAD 4: CHEQUEO DE DOMINIO REAL (MX) ---
    const esDominioReal = await validarDominioReal(emailLimpio);
    if (!esDominioReal) {
      return res.status(400).json({ message: 'El dominio del correo no existe o no puede recibir mensajes.' });
    }

    // --- LÓGICA DE BASE DE DATOS Y PIN ---
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [emailLimpio]);
    
    const pin = generatePIN();
    const expiresAt = new Date(Date.now() + 15 * 60000); // El PIN caduca en 15 minutos

    if (userExist.rows.length > 0) {
      const userRecord = userExist.rows[0];
      
      if (userRecord.verificado) {
        return res.status(400).json({ message: 'Este correo ya está registrado. Inicia sesión.' });
      }

      // --- BLOQUEO ANTI-SPAM (5 MINUTOS) ---
      // Si tiene un PIN no caducado, calculamos hace cuánto se generó
      if (userRecord.pin_expires_at && userRecord.pin_expires_at > new Date()) {
        const expiracionReal = new Date(userRecord.pin_expires_at).getTime();
        const tiempoPasadoMs = (15 * 60000) - (expiracionReal - Date.now()); // Milisegundos desde que se creó
        
        if (tiempoPasadoMs < 5 * 60000) { // Si han pasado MENOS de 5 minutos
          return res.status(429).json({ 
            message: 'Ya se ha enviado un código recientemente. Por favor, revisa tu correo o espera 5 minutos para solicitar otro.' 
          });
        }
      }

      // Si han pasado más de 5 minutos, le generamos un PIN nuevo y actualizamos la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      await pool.query(
        'UPDATE users SET password_hash = $1, verification_pin = $2, pin_expires_at = $3 WHERE email = $4',
        [passwordHash, pin, expiresAt, emailLimpio]
      );

    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await pool.query(
        'INSERT INTO users (email, password_hash, role, verification_pin, pin_expires_at) VALUES ($1, $2, $3, $4, $5)',
        [emailLimpio, passwordHash, 'user', pin, expiresAt]
      );
    }

   
    try {
      await transporter.sendMail({
        from: `"Conexión Animal" <${process.env.EMAIL_USER}>`,
        to: emailLimpio,
        subject: '🐾 Verifica tu cuenta en Conexión Animal',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 2px solid #2563eb; border-radius: 10px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #2563eb;">¡Hola! Gracias por unirte a Conexión Animal</h2>
            <p>Para terminar tu registro y empezar a ayudar, introduce este código de verificación en la página:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a;">${pin}</span>
            </div>
            <p style="color: #6b7280; font-size: 13px;">Este código caduca en 15 minutos.</p>
            <p style="color: #ef4444; font-size: 12px; margin-top: 20px;">Si no has solicitado este registro, ignora este correo.</p>
          </div>
        `
      });
      console.log(`📧 Código enviado a ${emailLimpio}`);
    } catch (emailErr) {
      console.error("❌ Error al enviar el código por email:", emailErr);
      return res.status(500).json({ message: "No pudimos enviar el correo. Revisa tu dirección." });
    }

    res.status(200).json({ message: 'Código enviado a tu correo. Revisa también la carpeta de SPAM.' });

  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
};



const verifyEmail = async (req, res) => {
  const { email, pin } = req.body;

  try {
    if (!email || !pin) {
      return res.status(400).json({ message: 'Faltan datos de verificación.' });
    }

    const emailLimpio = validator.normalizeEmail(email);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [emailLimpio]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const user = result.rows[0];

    if (user.verificado) {
      return res.status(400).json({ message: 'Esta cuenta ya está verificada. Inicia sesión.' });
    }

    if (user.verification_pin !== pin) {
      return res.status(400).json({ message: 'El código de verificación es incorrecto.' });
    }

    if (new Date(user.pin_expires_at) < new Date()) {
      return res.status(400).json({ message: 'El código ha caducado (duraba 15 min). Vuelve atrás para solicitar otro.' });
    }

    const updatedUser = await pool.query(
      'UPDATE users SET verificado = true, verification_pin = NULL, pin_expires_at = NULL WHERE email = $1 RETURNING id, email, role, plan',
      [emailLimpio]
    );

    const activeUser = updatedUser.rows[0];

    // Ahora sí creamos el Token de acceso para loguearlo en la app
    const token = jwt.sign(
      { id: activeUser.id, role: activeUser.role, plan: activeUser.plan },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      message: 'Cuenta verificada y activada correctamente',
      token, 
      user: activeUser 
    });

  } catch (err) {
    console.error('Error al verificar PIN:', err.message);
    res.status(500).json({ message: 'Error del servidor al verificar el código.' });
  }
};


const login = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  try {
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'Seguridad: Falta token de validación' });
    }

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res.status(400).json({ message: 'Acceso denegado por seguridad' });
    }

    const emailLimpio = validator.normalizeEmail(email);
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [emailLimpio]);
    
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

 if (!user.rows[0].verificado) {
  return res.status(403).json({ 
    message: 'Tu cuenta no está verificada. Intenta registrarte de nuevo para recibir un código al correo.' 
  });
}

if (user.rows[0].estado === 'archivado') {
  return res.status(403).json({ message: 'Tu cuenta ha sido suspendida. Contacta con el administrador.' });
}


    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role, plan: user.rows[0].plan },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role, plan: user.rows[0].plan } });

  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


const resendPin = async (req, res) => {
  const { email, recaptchaToken } = req.body;

  try {
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'Seguridad: Falta token de validación' });
    }
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res.status(400).json({ message: 'Acceso denegado por seguridad' });
    }

    const emailLimpio = validator.normalizeEmail(email);

    // Buscamos al usuario
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [emailLimpio]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const user = result.rows[0];

    // Si ya está verificado, no mandamos nada
    if (user.verificado) {
      return res.status(400).json({ message: 'Esta cuenta ya está verificada.' });
    }

    // Regla de los 5 minutos
    if (user.pin_expires_at && user.pin_expires_at > new Date()) {
      const expiracionReal = new Date(user.pin_expires_at).getTime();
      const tiempoPasadoMs = (15 * 60000) - (expiracionReal - Date.now()); 
      
      if (tiempoPasadoMs < 5 * 60000) { 
        return res.status(429).json({ 
          message: 'Debes esperar 5 minutos desde el último envío.' 
        });
      }
    }

  
    const pin = generatePIN(); 
    const expiresAt = new Date(Date.now() + 15 * 60000);

    await pool.query(
      'UPDATE users SET verification_pin = $1, pin_expires_at = $2 WHERE email = $3',
      [pin, expiresAt, emailLimpio]
    );

    // Enviamos el correo
    await transporter.sendMail({
      from: `"Conexión Animal" <${process.env.EMAIL_USER}>`,
      to: emailLimpio,
      subject: '🐾 Tu nuevo código de Conexión Animal',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>Aquí tienes tu nuevo código</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a;">${pin}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Este código caduca en 15 minutos.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Nuevo código enviado con éxito.' });

  } catch (err) {
    console.error('Error al reenviar PIN:', err.message);
    res.status(500).json({ message: 'Error del servidor al reenviar el código.' });
  }
};
const crypto = require('crypto');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'El formato del correo no es válido.' });
    }

    const emailLimpio = validator.normalizeEmail(email);
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [emailLimpio]);

    if (result.rows.length === 0 || !result.rows[0].verificado) {
      return res.status(200).json({ message: 'Si el correo existe, recibirás un enlace en breve.' });
    }

    const user = result.rows[0];

    if (user.reset_token_expires_at && user.reset_token_expires_at > new Date()) {
      const expiracion = new Date(user.reset_token_expires_at).getTime();
      const tiempoPasado = (15 * 60000) - (expiracion - Date.now());
      if (tiempoPasado < 5 * 60000) {
        return res.status(429).json({ message: 'Ya se envió un enlace recientemente. Espera 5 minutos.' });
      }
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60000);

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE email = $3',
      [resetToken, expiresAt, emailLimpio]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Conexión Animal" <${process.env.EMAIL_USER}>`,
      to: emailLimpio,
      subject: '🔑 Recupera tu contraseña en Conexión Animal',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 2px solid #2563eb; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Recuperación de contraseña</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar:</p>
          <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Restablecer Contraseña
          </a>
          <p style="color: #6b7280; font-size: 13px;">Este enlace caduca en 15 minutos.</p>
          <p style="color: #ef4444; font-size: 12px; margin-top: 20px;">Si no has solicitado este cambio, ignora este correo. Tu cuenta sigue segura.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Si el correo existe, recibirás un enlace en breve.' });

  } catch (err) {
    console.error('Error en forgotPassword:', err.message);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};


const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Faltan datos.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Buscamos al usuario por el token
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'El enlace no es válido.' });
    }

    const user = result.rows[0];

    // Verificamos que no haya caducado
    if (new Date(user.reset_token_expires_at) < new Date()) {
      return res.status(400).json({ message: 'El enlace ha caducado. Solicita uno nuevo.' });
    }

    // Hasheamos la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Actualizamos la contraseña y limpiamos el token
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    res.status(200).json({ message: '¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.' });

  } catch (err) {
    console.error('Error en resetPassword:', err.message);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};
module.exports = { register, verifyEmail, login, resendPin,forgotPassword,resetPassword };