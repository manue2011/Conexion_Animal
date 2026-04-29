const express = require('express');
const router = express.Router();

const { 
  solicitarRol, 
  getMiColonia, 
  updateColonia,
  getMiProtectora,
  updateProtectora ,
  getPublicColonias
} = require('../controllers/userController');

const { verifyToken } = require('../middleware/authMiddleware');
router.get('/public', getPublicColonias);

router.get('/mi-colonia', verifyToken, getMiColonia);
router.put('/colonia/:id', verifyToken, updateColonia);

router.get('/mi-protectora', verifyToken, getMiProtectora);
router.put('/protectora/:id', verifyToken, updateProtectora);

router.post('/solicitar-rol', verifyToken, solicitarRol);

module.exports = router;