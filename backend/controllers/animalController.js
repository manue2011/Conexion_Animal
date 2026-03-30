const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

// 1. CREAR ANIMAL
const createAnimal = async (req, res) => {
  try {
    const { nombre, descripcion, edad, especie, urgent } = req.body;
    const { id: userId, role: userRole } = req.user;

    // Limpieza de edad
    const edadFinal = (edad === "" || edad === undefined) ? null : parseInt(edad);
    
    // Subida de imagen
    let foto_url = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "conexion_animal_fotos" });
      foto_url = result.secure_url;
    }

    // Definimos qué columna y qué subconsulta usar según el rol
    let targetColumn, idSubquery;

    if (userRole === 'admin') {
      targetColumn = 'protectora_id';
      idSubquery = `(SELECT protectora_id FROM protectora_admins WHERE user_id = $7 LIMIT 1)`;
    } else if (userRole === 'gestor') {
      targetColumn = 'colonia_id';
      idSubquery = `(SELECT id FROM colonias WHERE gestor_id = $7 LIMIT 1)`;
    } else if (userRole === 'superadmin') {
      targetColumn = 'protectora_id';
      idSubquery = `(SELECT id FROM protectoras LIMIT 1)`;
    }

    const query = `
      INSERT INTO animales (nombre, descripcion, edad, especie, urgent, foto_url, ${targetColumn}, estado) 
      VALUES ($1, $2, $3, $4, $5, $6, ${idSubquery}, 'activo') 
      RETURNING *`;

    const params = [nombre, descripcion, edadFinal, especie, urgent || false, foto_url, userId];
    const result = await pool.query(query, params);

    res.status(201).json({ message: "¡Animal registrado!", animal: result.rows[0] });

  } catch (err) {
    console.error("Error al crear:", err.message);
    res.status(500).json({ message: "Error al registrar el animal" });
  }
};

// 2. OBTENER ANIMALES
const getAnimals = async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;
    let query, params = [];

    if (userRole === 'superadmin') {
      query = "SELECT * FROM animales WHERE estado = 'activo' ORDER BY created_at DESC";
    } else if (userRole === 'admin') {
      query = `
        SELECT a.* FROM animales a
        JOIN protectora_admins pa ON a.protectora_id = pa.protectora_id
        WHERE pa.user_id = $1 AND a.estado = 'activo'
        ORDER BY a.created_at DESC`;
      params = [userId];
    } else {
      query = `
        SELECT a.* FROM animales a
        JOIN colonias c ON a.colonia_id = c.id
        WHERE c.gestor_id = $1 AND a.estado = 'activo'
        ORDER BY a.created_at DESC`;
      params = [userId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener:", err.message);
    res.status(500).json({ message: "Error al obtener animales" });
  }
};

// 3. ACTUALIZAR Y 4. BORRAR (Simplificados)
const updateAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, edad, especie, urgent, estado } = req.body;
    const query = `UPDATE animales SET nombre = $1, descripcion = $2, edad = $3, especie = $4, urgent = $5, estado = $6 WHERE id = $7 RETURNING *`;
    const result = await pool.query(query, [nombre, descripcion, edad, especie, urgent, estado, id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Animal no encontrado" });
    res.json({ message: "Animal actualizado", animal: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar" });
  }
};

const deleteAnimal = async (req, res) => {
  try {
    const result = await pool.query(`UPDATE animales SET estado = 'archivado' WHERE id = $1 RETURNING *`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Animal no encontrado" });
    res.json({ message: "Animal archivado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};

// NUEVO: Obtener animales para el público (Solo protectoras)
const getPublicAnimals = async (req, res) => {
  try {
    // Filtramos: que tengan protectora_id (no son de colonia) y estén activos
    const query = `
      SELECT * FROM animales 
      WHERE protectora_id IS NOT NULL 
      AND estado = 'activo' 
      ORDER BY created_at DESC`;
      
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error al obtener catálogo" });
  }
};
const getAnimalById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM animales WHERE id = $1 AND estado = 'activo'", 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Animal no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener detalles" });
  }
  
};

// No olvides añadirla al module.exports:
module.exports = { 
  createAnimal, 
  getAnimals, 
  updateAnimal, 
  deleteAnimal, 
  getPublicAnimals,
  getAnimalById
};

