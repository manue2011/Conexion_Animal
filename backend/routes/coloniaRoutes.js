const express = require('express');
const router = express.Router();
const { getMisColonias, updateColonia, getAllColonias } = require('../controllers/coloniaController');
const { verifyToken, isGestor } = require('../middleware/authMiddleware');


router.get('/public', getAllColonias);

router.get('/mis-colonias', verifyToken, isGestor, getMisColonias);
router.put('/:id', verifyToken, isGestor, updateColonia);

module.exports = router;