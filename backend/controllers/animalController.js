const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

// 1. CREAR ANIMAL
const createAnimal = async (req, res) => {
  try {
    // 1. Extraemos también 'ubicacion' del cuerpo
    const { nombre, descripcion, edad, especie, urgent, ubicacion } = req.body;
    const { id: userId, role: userRole } = req.user;

    const edadFinal = (edad === "" || edad === undefined) ? null : parseInt(edad);
    
    let foto_url = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "conexion_animal_fotos" });
      foto_url = result.secure_url;
    }

    let targetColumn, idSubquery;

    // 🚨 IMPORTANTE: Cambiamos $7 por $8 porque 'ubicacion' ocupará el puesto $7
    if (userRole === 'admin') {
      targetColumn = 'protectora_id';
      idSubquery = `(SELECT protectora_id FROM protectora_admins WHERE user_id = $8 LIMIT 1)`;
    } else if (userRole === 'gestor') {
      targetColumn = 'colonia_id';
      idSubquery = `(SELECT id FROM colonias WHERE gestor_id = $8 LIMIT 1)`;
    } else if (userRole === 'superadmin') {
      targetColumn = 'protectora_id';
      idSubquery = `(SELECT id FROM protectoras LIMIT 1)`;
    }

    // 2. Añadimos 'ubicacion' a la lista de columnas y valores ($7)
    const query = `
      INSERT INTO animales (nombre, descripcion, edad, especie, urgent, foto_url, ubicacion, ${targetColumn}, estado) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, ${idSubquery}, 'activo') 
      RETURNING *`;

    // 3. Añadimos 'ubicacion' al array de params antes del userId
    const params = [
      nombre, 
      descripcion, 
      edadFinal, 
      especie, 
      urgent || false, 
      foto_url, 
      ubicacion || null, // $7
      userId             // $8
    ];

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
const getPublicAnimals = async (req, res) => {
  const { especie, urgent, ubicacion } = req.query; // Cambiamos 'nombre' por 'ubicacion'

  try {
    let query = `
      SELECT a.*, p.direccion as protectora_direccion 
      FROM animales a
      LEFT JOIN protectoras p ON a.protectora_id = p.id
      WHERE a.estado = 'activo'
    `;
    let params = [];
    let count = 1;

    if (especie && especie !== 'Todos') {
      query += ` AND a.especie ILIKE $${count}`;
      params.push(especie);
      count++;
    }

    if (urgent === 'true') {
      query += ` AND a.urgent = true`;
    }

    if (ubicacion && ubicacion.trim() !== "") {
      query += ` AND a.ubicacion ILIKE $${count}`;
      params.push(`%${ubicacion.trim()}%`);
      count++;
    }

    query += " ORDER BY a.urgent DESC, a.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error al filtrar" });
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

