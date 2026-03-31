const express = require('express');
const router = express.Router();

// 🚨 AQUÍ ESTABA EL FALLO: Tienes que añadir 'getMiProtectora' y 'updateProtectora'
const { 
  solicitarRol, 
  getMiColonia, 
  updateColonia,
  getMiProtectora,
  updateProtectora 
} = require('../controllers/userController');

const { verifyToken } = require('../middleware/authMiddleware');

// RUTAS DE COLONIAS
router.get('/mi-colonia', verifyToken, getMiColonia);
router.put('/colonia/:id', verifyToken, updateColonia);

// RUTAS DE PROTECTORAS
router.get('/mi-protectora', verifyToken, getMiProtectora);
router.put('/protectora/:id', verifyToken, updateProtectora);

// SOLICITUD DE ROL
router.post('/solicitar-rol', verifyToken, solicitarRol);

module.exports = router;