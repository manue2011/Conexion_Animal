const express = require('express');
const router = express.Router();
const { enviarContacto } = require('../controllers/contactoController');

// Definir la ruta POST para el formulario
router.post('/', enviarContacto);

module.exports = router;