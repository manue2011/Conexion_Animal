const express = require('express');
const router = express.Router();
const { getMisColonias, updateColonia, getAllColonias } = require('../controllers/coloniaController');
const { verifyToken, verifyGestor } = require('../middleware/authMiddleware');


router.get('/public', getAllColonias);

router.get('/mis-colonias', verifyToken, verifyGestor, getMisColonias);
router.put('/:id', verifyToken, verifyGestor, updateColonia);

module.exports = router;