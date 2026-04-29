const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

// 1. CREAR ANIMAL
const createAnimal = async (req, res) => {
  try {
    const { nombre, descripcion, edad, especie, urgent, ubicacion } = req.body;
    const { id: userId, role: userRole } = req.user;

    const edadFinal = (edad === "" || edad === undefined) ? null : parseInt(edad);
    
    let foto_url = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "conexion_animal_fotos" });
      foto_url = result.secure_url;
    }

    let targetColumn, idSubquery;

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

    const query = `
      INSERT INTO animales (nombre, descripcion, edad, especie, urgent, foto_url, ubicacion, ${targetColumn}, estado) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, ${idSubquery}, 'activo') 
      RETURNING *`;

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
    const { especie, order, page = 1, limit = 8 } = req.query;

    let baseQuery = "";
    let countQuery = "";
    let params = [];
    let count = 1;

    if (userRole === 'superadmin') {
      baseQuery = "SELECT * FROM animales WHERE estado = 'activo'";
      countQuery = "SELECT COUNT(*) FROM animales WHERE estado = 'activo'";
    } else if (userRole === 'admin') {
      baseQuery = `
        SELECT a.* FROM animales a
        JOIN protectora_admins pa ON a.protectora_id = pa.protectora_id
        WHERE pa.user_id = $1 AND a.estado = 'activo'`;
      countQuery = `
        SELECT COUNT(*) FROM animales a
        JOIN protectora_admins pa ON a.protectora_id = pa.protectora_id
        WHERE pa.user_id = $1 AND a.estado = 'activo'`;
      params.push(userId);
      count++;
    } else {
      baseQuery = `
        SELECT a.* FROM animales a
        JOIN colonias c ON a.colonia_id = c.id
        WHERE c.gestor_id = $1 AND a.estado = 'activo'`;
      countQuery = `
        SELECT COUNT(*) FROM animales a
        JOIN colonias c ON a.colonia_id = c.id
        WHERE c.gestor_id = $1 AND a.estado = 'activo'`;
      params.push(userId);
      count++;
    }

    if (especie && especie.trim() !== '') {
      const filtroEspecie = ` AND a.especie ILIKE $${count}`;
      baseQuery += (userRole === 'superadmin' ? ` AND especie ILIKE $${count}` : filtroEspecie);
      countQuery += (userRole === 'superadmin' ? ` AND especie ILIKE $${count}` : filtroEspecie);
      params.push(especie);
      count++;
    }

    const totalResult = await pool.query(countQuery, params);
    const total = parseInt(totalResult.rows[0].count);

    const orden = order === 'asc' ? 'ASC' : 'DESC';
    baseQuery += userRole === 'superadmin' 
      ? ` ORDER BY created_at ${orden}` 
      : ` ORDER BY a.created_at ${orden}`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    baseQuery += ` LIMIT $${count} OFFSET $${count + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(baseQuery, params);

    res.json({
      animales: result.rows,
      total: total
    });

  } catch (err) {
    console.error("Error al obtener:", err.message);
    res.status(500).json({ message: "Error al obtener animales" });
  }
};

// 3. ACTUALIZAR Y 4. BORRAR 
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
};const getPublicAnimals = async (req, res) => {
  const { especie, urgent, ubicacion, page = 1, limit = 8 } = req.query;

  try {
    let baseQuery = `
      SELECT a.*, p.direccion as protectora_direccion 
      FROM animales a
      LEFT JOIN protectoras p ON a.protectora_id = p.id
      WHERE a.estado = 'activo'
    `;
    let countQuery = `
      SELECT COUNT(*) FROM animales a
      WHERE a.estado = 'activo'
    `;
    let params = [];
    let count = 1;

    if (especie && especie !== 'Todos') {
      const filtro = ` AND a.especie ILIKE $${count}`;
      baseQuery += filtro;
      countQuery += filtro;
      params.push(especie);
      count++;
    }

    if (urgent === 'true') {
      baseQuery += ` AND a.urgent = true`;
      countQuery += ` AND a.urgent = true`;
    }

    if (ubicacion && ubicacion.trim() !== '') {
      const filtro = ` AND a.ubicacion ILIKE $${count}`;
      baseQuery += filtro;
      countQuery += filtro;
      params.push(`%${ubicacion.trim()}%`);
      count++;
    }

    const totalResult = await pool.query(countQuery, params);
    const total = parseInt(totalResult.rows[0].count);

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    baseQuery += ` ORDER BY a.urgent DESC, a.created_at DESC LIMIT $${count} OFFSET $${count + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(baseQuery, params);

    res.json({
      animales: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error al filtrar' });
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
const getAdoptados = async (req, res) => {
  try {
    const result = await pool.query(
     
      "SELECT id, nombre, foto_url FROM animales WHERE estado = 'adoptado' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al obtener adoptados');
  }
};

module.exports = { 
  createAnimal, 
  getAnimals, 
  updateAnimal, 
  deleteAnimal, 
  getPublicAnimals,
  getAnimalById,
  getAdoptados
};

