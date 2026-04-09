const express = require('express');
const router = express.Router();
const { getMisColonias, updateColonia, getAllColonias } = require('../controllers/coloniaController');
const { verifyToken, isGestor } = require('../middleware/authMiddleware');

// 🌍 Ruta Pública (Cualquiera puede ver el mapa)
router.get('/public', getAllColonias);

// 🔒 Rutas Protegidas (Solo para el Gestor)
router.get('/mis-colonias', verifyToken, isGestor, getMisColonias);
router.put('/:id', verifyToken, isGestor, updateColonia);

module.exports = router;