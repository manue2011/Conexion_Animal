const express = require('express');
const router = express.Router();
const { getPendingRequests, procesarSolicitud,getEntidadesExistentes, obtenerMetricasGlobales, obtenerListadoEntidades, actualizarEntidad, obtenerStaff, asignarSuperAdmin, obtenerUsuariosPro, getUsuarios, toggleBanUsuario } = require('../controllers/superAdminController');
const { verifyToken, verifySuperAdmin } = require('../middleware/authMiddleware');

router.get('/solicitudes', verifyToken, verifySuperAdmin, getPendingRequests);

router.put('/solicitudes/:id', verifyToken, verifySuperAdmin, procesarSolicitud);

// Ruta para obtener entidades existentes
router.get('/entidades-existentes', verifyToken, verifySuperAdmin, getEntidadesExistentes);
router.get('/stats/global', verifyToken, verifySuperAdmin, obtenerMetricasGlobales);
router.get('/entidades-maestro', verifyToken, verifySuperAdmin, obtenerListadoEntidades);
router.put('/entidades/:tipo/:id', verifyToken, verifySuperAdmin, actualizarEntidad);
router.get('/staff', verifyToken, verifySuperAdmin, obtenerStaff);
router.get('/usuarios', verifyToken, verifySuperAdmin, getUsuarios);
router.put('/usuarios/:id/ban', verifyToken, verifySuperAdmin, toggleBanUsuario);


router.get('/usuarios-pro', verifyToken, verifySuperAdmin, obtenerUsuariosPro);

router.post('/staff/asignar', verifyToken, verifySuperAdmin, asignarSuperAdmin);

module.exports = router;