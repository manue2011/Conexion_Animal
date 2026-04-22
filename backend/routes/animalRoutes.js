const express = require('express');
const router = express.Router();
const { 
  createAnimal, 
  getAnimals, 
  updateAnimal, 
  deleteAnimal,
  getPublicAnimals,
  getAnimalById
} = require("../controllers/animalController");
const { verifyToken, checkAnimalLimit } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });



// --- AQUÍ ES DONDE VAN LAS RUTAS ---
router.get("/public", getPublicAnimals);
router.get("/public/:id", getAnimalById);
// GET para obtener animales (pasa por verifyToken y luego al controlador)
router.get("/", verifyToken, getAnimals); 
// Ruta pública para la Home (Sin verifyToken)
// POST para crear animal
router.post("/", verifyToken,checkAnimalLimit, upload.single("foto_url"), createAnimal);

// PUT y DELETE
router.put("/:id", verifyToken, updateAnimal);
router.delete("/:id", verifyToken, deleteAnimal);

module.exports = router;