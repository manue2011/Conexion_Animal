const pool = require('../config/db');

// 1. SOLICITAR ROL (Para usuarios que quieren ser Admin/Gestor)
const solicitarRol = async (req, res) => {
  const { rol_solicitado, mensaje, telefono, entidad_solicitada } = req.body;
  const user_id = req.user.id; 

  try {
    const exist = await pool.query(
      "SELECT * FROM solicitudes_rol WHERE user_id = $1 AND estado = 'pendiente'", 
      [user_id]
    );

    if (exist.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Ya tienes una solicitud en proceso. Por favor, espera a que Manuel la revise.' 
      });
    }

    // Actualizamos contacto en la tabla users
    await pool.query(
      "UPDATE users SET telefono = $1, entidad_solicitada = $2 WHERE id = $3",
      [telefono, entidad_solicitada, user_id]
    );

    // Insertamos la solicitud
    await pool.query(
      "INSERT INTO solicitudes_rol (user_id, rol_solicitado, mensaje) VALUES ($1, $2, $3)",
      [user_id, rol_solicitado, mensaje]
    );

    res.status(201).json({ message: 'Solicitud enviada correctamente.' });

  } catch (err) {
    console.error("Error en solicitarRol:", err.message);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

// 2. OBTENER MI COLONIA (Para el Dashboard del Gestor)
const getMiColonia = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM colonias WHERE gestor_id = $1", 
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No tienes una colonia asignada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener perfil de colonia" });
  }
};

// 3. ACTUALIZAR DATOS DE COLONIA (¡NUEVA! Para completar latitud/longitud)
const updateColonia = async (req, res) => {
  const { id } = req.params;
  const { descripcion, direccion } = req.body; // <-- Solo estos dos
  const userId = req.user.id;

  try {
    const check = await pool.query("SELECT * FROM colonias WHERE id = $1 AND gestor_id = $2", [id, userId]);
    
    if (check.rows.length === 0) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    await pool.query(
      "UPDATE colonias SET descripcion = $1, direccion = $2 WHERE id = $3",
      [descripcion, direccion, id]
    );

    res.json({ message: "Perfil de colonia actualizado" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar" });
  }
};// OBTENER MI PROTECTORA
const getMiProtectora = async (req, res) => {
  try {
    const userId = req.user.id;
    // Buscamos en la tabla puente protectora_admins
    const result = await pool.query(
      `SELECT p.* FROM protectoras p 
       JOIN protectora_admins pa ON p.id = pa.protectora_id 
       WHERE pa.user_id = $1`, 
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No tienes una protectora asignada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener perfil de protectora" });
  }
};

// ACTUALIZAR PROTECTORA
const updateProtectora = async (req, res) => {
  const { id } = req.params;
  const { descripcion, direccion, telefono } = req.body;
  const userId = req.user.id;

  try {
    // Verificamos propiedad
    const check = await pool.query("SELECT * FROM protectora_admins WHERE protectora_id = $1 AND user_id = $2", [id, userId]);
    if (check.rows.length === 0) return res.status(403).json({ message: "No autorizado" });

    await pool.query(
      "UPDATE protectoras SET descripcion = $1, direccion = $2, telefono = $3 WHERE id = $4",
      [descripcion, direccion, telefono, id]
    );

    res.json({ message: "Protectora actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar" });
  }
};



module.exports = { 
  solicitarRol, 
  getMiColonia, 
  updateColonia, 
  getMiProtectora, 
  updateProtectora 
};