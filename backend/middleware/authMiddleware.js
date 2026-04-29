const pool = require('../config/db')
const jwt = require('jsonwebtoken');

// 1. Verificar si el usuario está logueado (tiene Token)
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
const result = await pool.query(
      'SELECT id, role, estado FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

    if (user.estado === 'archivado') {
      return res.status(403).json({ message: 'Tu cuenta ha sido suspendida. Contacta con el administrador.' });
    }

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
// Middleware para comprobar si es Gestor (o un rol superior como superadmin)
const isGestor = (req, res, next) => {
  if (req.user && (req.user.role === 'gestor' || req.user.role === 'superadmin')) {
    next(); 
  } else {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Gestor." });
  }
};


const verifySuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next(); 
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

// Middleware para controlar el límite del Plan Free (Máximo 50 animales)
const checkAnimalLimit = async (req, res, next) => {
  try {
    // Si es SuperAdmin o Gestor de Colonia, tienen barra libre (sin límites)
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
    // Si es plan gratuito, contamos sus animales activos
    if (plan === 'free') {
      const countResult = await pool.query(
        "SELECT COUNT(*)::INT FROM animales WHERE protectora_id = $1 AND estado = 'activo'",
        [prot_id]
      );

      if (countResult.rows[0].count >= 50) {
        return res.status(403).json({ 
          message: "Límite de 50 animales alcanzado. Pásate a PRO para seguir publicando." 
        });
      }
    }

    next(); 
  } catch (error) {
    res.status(500).json({ message: "Error al verificar límites del plan." });
  }
};


module.exports = { verifyToken, verifyAdmin, verifySuperAdmin, verifyGestor, isGestor,checkAnimalLimit};

