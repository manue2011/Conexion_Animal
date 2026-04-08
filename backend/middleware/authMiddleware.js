// Archivo: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Verificar si el usuario está logueado (tiene Token)
const verifyToken = (req, res, next) => {
  // El token suele venir en el header así: "Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];
  
  // Si no hay header o no empieza por Bearer, fuera.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  // Extraemos solo el código largo (quitamos la palabra "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verificamos si el token es real y no ha caducado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guardamos los datos del usuario (id, role) en la petición
    next(); // ¡Pase usted! Continúa al siguiente paso
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// 2. Verificar si el usuario es Administrador
const verifyAdmin = (req, res, next) => {
  // Primero debe pasar por verifyToken para tener req.user
  if (req.user && req.user.role === 'admin') {
    next(); // Es admin, adelante.
  } else {
    res.status(403).json({ message: 'Acceso prohibido. Se requieren permisos de Administrador.' });
  }
};
// Middleware para comprobar si es Gestor (o un rol superior como superadmin)
const isGestor = (req, res, next) => {
  if (req.user && (req.user.role === 'gestor' || req.user.role === 'superadmin')) {
    next(); // ¡Adelante, puedes pasar!
  } else {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Gestor." });
  }
};

module.exports = { verifyToken, verifyAdmin, isGestor };