const express = require('express');
const router = express.Router();
const { getSubscriptionStatus } = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/subscriptions/status
// Usamos verifyToken para saber quién es el usuario logueado
router.get('/status', verifyToken, getSubscriptionStatus);

module.exports = router;