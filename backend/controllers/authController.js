// Archivo: backend/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRO DE USUARIO
const register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // A. Validar que el usuario no exista ya
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // B. Encriptar contraseña (Hashing)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // C. Insertar en Base de Datos ( usamos 'password_hash' como en el schema.sql)
    // Por defecto el rol será 'user' si no se especifica, y 'verificado' es false.
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, role || 'user']
    );

    // D. Generar Token JWT (El "pase" de sesión)
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// 2. LOGIN DE USUARIO
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // A. Verificar si el usuario existe
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // B. Comparar contraseñas (La que escribe vs la encriptada en BD)
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // C. Generar Token JWT
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = { register, login };