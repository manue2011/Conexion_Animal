const router = require('express').Router();
const { register, verifyEmail, login, resendPin} = require('../controllers/authController');


router.post('/register', register);
router.post('/verify-email', verifyEmail); 
router.post('/resend-pin', resendPin);

router.post('/login', login);

module.exports = router;