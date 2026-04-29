const express = require('express');
const router = express.Router();


const { 
  crearPost, 
  obtenerTablon, 
  obtenerPendientes, 
  moderarPost,
} = require('../controllers/postsController');


const { verifyToken, verifySuperAdmin } = require('../middleware/authMiddleware');


router.get('/', obtenerTablon); 

// Crear post: Solo requiere estar logueado (nace como 'pending')
router.post('/', verifyToken, crearPost); 


router.get('/superadmin/moderate', verifyToken, verifySuperAdmin, obtenerPendientes);

// Aprobar o rechazar un post: Requiere token Y ser superadmin
router.patch('/superadmin/moderate/:id', verifyToken, verifySuperAdmin, moderarPost);


module.exports = router;