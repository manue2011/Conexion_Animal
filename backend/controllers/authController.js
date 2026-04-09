const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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
    // MEJORA 2: Validar siempre el reCAPTCHA (o al menos mientras testeas)
    // He quitado el IF de producción para que puedas ver si funciona en local
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'No se recibió el token de seguridad' });
    }

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    console.log('Resultado reCAPTCHA:', recaptchaResult);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res.status(400).json({ message: 'Verificación de seguridad fallida. ¿Eres un bot?' });
    }

    // --- Lógica de base de datos ---
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, 'user']
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