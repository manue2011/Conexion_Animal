const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { 
  getSubscriptionStatus, 
  createCheckoutSession, 
  handleStripeWebhook 
} = require('../controllers/subscriptionController');

router.get('/status', verifyToken, getSubscriptionStatus);

router.post('/create-checkout', verifyToken, createCheckoutSession);

router.post('/webhook', handleStripeWebhook);

module.exports = router;