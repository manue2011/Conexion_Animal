// Archivo: backend/controllers/animalController.js
const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

// 1. CREAR UN NUEVO ANIMAL
const createAnimal = async (req, res) => {
  try {
    // A. Recogemos los datos que envía el usuario (texto)
    const { nombre, descripcion, edad, especie, urgent } = req.body;

    // B. Manejo de la IMAGEN (Cloudinary)
    let foto_url = null;

    // Si el usuario subió una foto (req.file viene de Multer, lo configuraremos luego)
    if (req.file) {
      // Subimos la imagen a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "conexion_animal_fotos", // Carpeta en tu nube
      });
      foto_url = result.secure_url; // Guardamos el link de internet de la foto
    }

    // C. Guardar en la Base de Datos
    // Fíjate que el 'protectora_id' lo sacamos de una consulta fija o del usuario logueado.
    // Para este MVP, asumiremos que el usuario admin tiene una protectora asignada.
    // NOTA: De momento usaremos un ID fijo de prueba o el del usuario si no tienes la tabla pivote llena.
    // Simplificación: Asumiremos que el usuario logueado (req.user.id) gestiona la protectora.

    // Consulta SQL para insertar
    const newAnimal = await pool.query(
      `INSERT INTO animales (nombre, descripcion, edad, especie, urgent, foto_url, protectora_id, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, 
       (SELECT id FROM protectoras LIMIT 1), -- TRUCO: Asignamos la primera protectora que encuentre (para no complicarnos ahora)
       'activo') 
       RETURNING *`,
      [nombre, descripcion, edad, especie, urgent || false, foto_url]
    );

    res.status(201).json({
      message: "¡Animal registrado con éxito!",
      animal: newAnimal.rows[0],
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al registrar el animal", error: err.message });
  }
};
const getAnimals = async (req, res) => {
  try {
    // Seleccionamos solo los que no han sido borrados (Soft Delete)
    // Recuerda el Glossario: estado 'activo' [cite: 3]
    const response = await pool.query(
      "SELECT * FROM animales WHERE estado = $1",
      ["activo"]
    );

    res.json(response.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener animales");
  }
};
// ... (código anterior: createAnimal y getAnimals) ...

// 3. ACTUALIZAR UN ANIMAL (PUT)
const updateAnimal = async (req, res) => {
  try {
    const { id } = req.params; // El ID viene en la URL
    const { nombre, descripcion, edad, especie, urgent, estado } = req.body;

    // Ejecutamos la actualización
    const result = await pool.query(
      `UPDATE animales 
       SET nombre = $1, descripcion = $2, edad = $3, especie = $4, urgent = $5, estado = $6
       WHERE id = $7 RETURNING *`,
      [nombre, descripcion, edad, especie, urgent, estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Animal no encontrado" });
    }

    res.json({ message: "Animal actualizado", animal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar");
  }
};

// 4. BORRADO LÓGICO (DELETE - Soft Delete)
const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;

    // ¡OJO! No usamos DELETE FROM. Usamos UPDATE para cambiar el estado a 'archivado'.
    // Esto cumple con el requisito de "Soft Delete" de tu memoria.
    const result = await pool.query(
      `UPDATE animales SET estado = 'archivado' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Animal no encontrado" });
    }

    res.json({ message: "Animal archivado correctamente (Soft Delete)" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar");
  }
};

// --- IMPORTANTE: Actualiza el export final con las 4 funciones ---
module.exports = { createAnimal, getAnimals, updateAnimal, deleteAnimal };

