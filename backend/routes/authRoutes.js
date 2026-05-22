const router = require('express').Router();
const { register, verifyEmail, login, resendPin, forgotPassword, resetPassword, logout,verifySession} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware')

router.post('/register', register);
router.post('/verify-email', verifyEmail); 
router.post('/resend-pin', resendPin);

router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify', verifyToken, verifySession);
module.exports = router;
