const express = require('express');
const router = express.Router();
const { 
  createAnimal, 
  getAnimals, 
  updateAnimal, 
  deleteAnimal,
  getPublicAnimals,
  getAnimalById,
  getAdoptados,
  getAdoptadosPublic
} = require("../controllers/animalController");

const { verifyToken, checkAnimalLimit } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


router.get("/adoptados", getAdoptadosPublic); l
router.get("/public", getPublicAnimals);
router.get("/public/:id", getAnimalById);

router.get("/adoptados/lista", verifyToken, getAdoptados); 
router.get("/", verifyToken, getAnimals); 

router.post("/", verifyToken, checkAnimalLimit, upload.single("foto_url"), createAnimal);


router.put("/:id", verifyToken, updateAnimal);
router.delete("/:id", verifyToken, deleteAnimal);

module.exports = router;