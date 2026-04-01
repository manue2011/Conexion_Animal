const express = require('express');
const router = express.Router();

// Importamos la función que creamos en el controlador
const { crearNecesidad } = require('../controllers/necesidadesController');

// Importamos el middleware de seguridad
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/necesidades -> Crear una nueva necesidad
router.post('/', verifyToken, crearNecesidad);

module.exports = router;