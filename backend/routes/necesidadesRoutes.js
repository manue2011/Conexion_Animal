const express = require('express');
const router = express.Router();

const { crearNecesidad } = require('../controllers/necesidadesController');


const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, crearNecesidad);

module.exports = router;