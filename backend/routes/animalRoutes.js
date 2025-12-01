// Archivo: backend/routes/animalRoutes.js
const router = require("express").Router();
const multer = require("multer");
const {
  createAnimal,
  getAnimals,
  updateAnimal,
  deleteAnimal,
} = require("../controllers/animalController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// --- Configuración de Multer (El "Portero" de los archivos) ---
// Le decimos que guarde el archivo temporalmente en la carpeta 'uploads/' del sistema
// Cloudinary lo leerá de ahí y luego lo borraremos (o el sistema lo limpia).
const upload = multer({ dest: "uploads/" });

// --- Definición de la Ruta ---
// POST /api/animales
// 1. Verifica Token (Seguridad)
// 2. Verifica Admin (Seguridad)
// 3. Procesa la imagen (Multer)
// 4. Ejecuta la lógica (Controlador)
router.get("/", getAnimals);
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  createAnimal
);
// PUT /api/animales/:id (Requiere ID en la URL y ser Admin)
router.put("/:id", verifyToken, verifyAdmin, updateAnimal);

// DELETE /api/animales/:id (Requiere ID en la URL y ser Admin)
router.delete("/:id", verifyToken, verifyAdmin, deleteAnimal);
module.exports = router;
