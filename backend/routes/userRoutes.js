// Archivo: backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { solicitarRol } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Solo usuarios logueados pueden pedir un rol
router.post('/solicitar-rol', verifyToken, solicitarRol);

module.exports = router;