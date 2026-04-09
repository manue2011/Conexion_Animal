const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const validator = require('validator'); 
const dns = require('dns').promises;    

const validarDominioReal = async (email) => {
  const dominio = email.split('@')[1];
  try {
    // Buscamos registros MX (Mail Exchange) en el DNS del dominio
    const records = await dns.resolveMx(dominio);
    return records && records.length > 0;
  } catch (err) {
    return false; // Si no hay registros o el dominio no existe
  }
};

// MEJORA 1: Usar URLSearchParams para enviar los datos como quiere Google
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

// 1. REGISTRO
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

    // --- SEGURIDAD 3: NORMALIZACIÓN (Puntos, mayúsculas, etc.) ---
    const emailLimpio = validator.normalizeEmail(email);

    // --- SEGURIDAD 4: CHEQUEO DE DOMINIO REAL (MX) ---
    // Esto rebota correos como "inventado@sdsd.com" al instante
    const esDominioReal = await validarDominioReal(emailLimpio);
    if (!esDominioReal) {
      return res.status(400).json({ message: 'El dominio del correo no existe o no puede recibir mensajes.' });
    }

    // --- Lógica de base de datos usando el EMAIL LIMPIO ---
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [emailLimpio]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'Este correo ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [emailLimpio, passwordHash, 'user']
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, user: newUser.rows[0] });

  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// 2. LOGIN
const login = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  try {
    // Validación de seguridad idéntica al registro
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'Seguridad: Falta token de validación' });
    }

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    
    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res.status(400).json({ message: 'Acceso denegado por seguridad' });
    }

    // --- Lógica de login ---
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role } });

  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = { register, login };