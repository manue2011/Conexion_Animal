const express = require('express');
const router = express.Router();
const { getPendingRequests, procesarSolicitud,getEntidadesExistentes, obtenerMetricasGlobales, obtenerListadoEntidades, actualizarEntidad, obtenerStaff, asignarSuperAdmin } = require('../controllers/superAdminController');
const { verifyToken, verifySuperAdmin } = require('../middleware/authMiddleware');

// Ruta para ver pendientes
router.get('/solicitudes', verifyToken, verifySuperAdmin, getPendingRequests);

// NUEVA RUTA: Para aprobar o rechazar (usamos PUT porque estamos actualizando un dato)
router.put('/solicitudes/:id', verifyToken, verifySuperAdmin, procesarSolicitud);

// Ruta para obtener entidades existentes
router.get('/entidades-existentes', verifyToken, verifySuperAdmin, getEntidadesExistentes);
router.get('/stats/global', verifyToken, verifySuperAdmin, obtenerMetricasGlobales);
router.get('/entidades-maestro', verifyToken, verifySuperAdmin, obtenerListadoEntidades);
router.put('/entidades/:tipo/:id', verifyToken, verifySuperAdmin, actualizarEntidad);
router.get('/staff', verifyToken, verifySuperAdmin, obtenerStaff);
router.post('/staff/asignar', verifyToken, verifySuperAdmin, asignarSuperAdmin);

module.exports = router;