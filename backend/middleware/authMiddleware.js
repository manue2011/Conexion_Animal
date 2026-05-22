const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// 1. Verificar si el usuario está logueado (tiene Token)
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;  
  
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se encontró la cookie de sesión.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Consultamos la BD para ver si sigue activo y qué rol real tiene AHORA
    const result = await pool.query(
      'SELECT id, role, estado FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado en la base de datos.' });
    }

    if (user.estado === 'archivado') {
      return res.status(403).json({ message: 'Tu cuenta ha sido suspendida. Contacta con el administrador.' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      estado: user.estado
    }; 
    
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// 2. Verificar si el usuario es Administrador (o superior)
const verifyAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next(); 
  } else {
    res.status(403).json({ message: 'Acceso prohibido. Se requieren permisos de Administrador.' });
  }
};

// 3. Verificar si es Gestor de Colonia (o superior)
// (He unificado isGestor y verifyGestor en uno solo para evitar bloqueos al SuperAdmin)
const verifyGestor = (req, res, next) => {
  if (req.user && (req.user.role === 'gestor' || req.user.role === 'superadmin')) {
    next(); 
  } else {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Gestor." });
  }
};

// 4. Verificar si es SuperAdmin (Nivel máximo)
const verifySuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next(); 
  } else {
    res.status(403).json({ message: 'Acceso prohibido. Área exclusiva de SuperAdmin.' });
  }
};

// 5. Controlar el límite del Plan Free (Máximo 20 animales, como dice el Frontend)
const checkAnimalLimit = async (req, res, next) => {
  try {
    // SuperAdmin o Gestor de Colonia tienen barra libre
    if (req.user.role === 'superadmin' || req.user.role === 'gestor') {
      return next();
    }

    // Buscamos el plan y el ID de protectora del usuario
    const userQuery = await pool.query(
      'SELECT plan, (SELECT protectora_id FROM protectora_admins WHERE user_id = $1 LIMIT 1) as prot_id FROM users WHERE id = $1',
      [req.user.id]
    );

    const { plan, prot_id } = userQuery.rows[0];
    
    if (!prot_id && req.user.role === 'admin') {
       return res.status(403).json({ message: "Aún no tienes una protectora asignada en el sistema." });
    }
    
    req.user.plan = plan;
    
    // Límite ajustado a 20 para que coincida con el plan "Solidario" de PlanesPage.jsx
    if (plan === 'free') {
      const countResult = await pool.query(
        "SELECT COUNT(*)::INT FROM animales WHERE protectora_id = $1 AND estado = 'activo'",
        [prot_id]
      );

      if (countResult.rows[0].count >= 20) {
        return res.status(403).json({ 
          message: "Límite de 20 animales alcanzado. Pásate a PRO para seguir publicando." 
        });
      }
    }

    next(); 
  } catch (error) {
    res.status(500).json({ message: "Error al verificar límites del plan." });
  }
};

// Exportamos los middlewares (ahora limpios y sin duplicados)
module.exports = { verifyToken, verifyAdmin, verifySuperAdmin, verifyGestor, checkAnimalLimit };