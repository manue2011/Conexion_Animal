// Archivo: backend/routes/adopcionRoutes.js
const router = require('express').Router();
const { crearSolicitud, getSolicitudes, updateSolicitud} = require('../controllers/adopcionController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// POST /api/adopciones
router.post('/', verifyToken, crearSolicitud);
router.get('/', verifyToken, verifyAdmin, getSolicitudes);
router.put('/:id', verifyToken, verifyAdmin, updateSolicitud);

module.exports = router;