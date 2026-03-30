const express = require('express');
const router = express.Router();
const { getPendingRequests, procesarSolicitud } = require('../controllers/superAdminController');
const { verifyToken, verifySuperAdmin } = require('../middleware/authMiddleware');

// Ruta para ver pendientes
router.get('/solicitudes', verifyToken, verifySuperAdmin, getPendingRequests);

// NUEVA RUTA: Para aprobar o rechazar (usamos PUT porque estamos actualizando un dato)
router.put('/solicitudes/:id', verifyToken, verifySuperAdmin, procesarSolicitud);

module.exports = router;