const express = require('express');
const router = express.Router();
const { 
  createAnimal, 
  getAnimals, 
  updateAnimal, 
  deleteAnimal,
  getPublicAnimals,
  getAnimalById,
  getAdoptados 
} = require("../controllers/animalController");

const { verifyToken, checkAnimalLimit } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// --- 1. RUTAS PÚBLICAS (Sin token) ---
router.get("/adoptados", getAdoptados);
router.get("/public", getPublicAnimals);
router.get("/public/:id", getAnimalById);

// --- 2. RUTAS PRIVADAS (Con token) ---
// GET para obtener animales de una protectora
router.get("/", verifyToken, getAnimals); 

// POST para crear animal
router.post("/", verifyToken, checkAnimalLimit, upload.single("foto_url"), createAnimal);

// PUT y DELETE
router.put("/:id", verifyToken, updateAnimal);
router.delete("/:id", verifyToken, deleteAnimal);

module.exports = router;