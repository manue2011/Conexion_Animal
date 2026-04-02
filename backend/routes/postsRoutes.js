// Archivo: backend/routes/postsRoutes.js
const express = require('express');
const router = express.Router();

// Importamos las funciones del controlador que hicimos en el paso anterior
const { 
  crearPost, 
  obtenerTablon, 
  obtenerPendientes, 
  moderarPost,
} = require('../controllers/postsController');

// Importamos exactamente tus middlewares desde authMiddleware.js
const { verifyToken, verifySuperAdmin } = require('../middleware/authMiddleware');

// ============================================================================
// 1. RUTAS PÚBLICAS Y DE USUARIOS
// ============================================================================

// El escaparate público: Cualquiera puede ver los posts aprobados (sin middleware)
router.get('/', obtenerTablon); 

// Crear post: Solo requiere estar logueado (nace como 'pending')
router.post('/', verifyToken, crearPost); 


// ============================================================================
// 2. RUTAS DE MODERACIÓN (EXCLUSIVAS PARA SUPERADMIN)
// ============================================================================
// Ver la cola de pendientes: Requiere token Y ser superadmin
router.get('/superadmin/moderate', verifyToken, verifySuperAdmin, obtenerPendientes);

// Aprobar o rechazar un post: Requiere token Y ser superadmin
router.patch('/superadmin/moderate/:id', verifyToken, verifySuperAdmin, moderarPost);


module.exports = router;