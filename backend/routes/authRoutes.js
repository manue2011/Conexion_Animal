const router = require('express').Router();
const { register, verifyEmail, login, resendPin, forgotPassword, resetPassword} = require('../controllers/authController');


router.post('/register', register);
router.post('/verify-email', verifyEmail); 
router.post('/resend-pin', resendPin);

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;