// Archivo: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Verificar si el usuario está logueado (tiene Token)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// 2. Verificar si el usuario es Administrador (Protectora)
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); 
  } else {
    res.status(403).json({ message: 'Acceso prohibido. Se requieren permisos de Administrador.' });
  }
};

// 3. NUEVO: Verificar si es SuperAdmin (Manuel)
const verifySuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next(); // Es el jefe supremo, adelante.
  } else {
    res.status(403).json({ message: 'Acceso prohibido. Área exclusiva de SuperAdmin.' });
  }
};

// 4. NUEVO: Verificar si es Gestor (Felipe)
const verifyGestor = (req, res, next) => {
  if (req.user && req.user.role === 'gestor') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso prohibido. Se requieren permisos de Gestor.' });
  }
};

// No olvides añadirla al module.exports al final del archivo:
module.exports = { verifyToken, verifyAdmin, verifySuperAdmin, verifyGestor };
