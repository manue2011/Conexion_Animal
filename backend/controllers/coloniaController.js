const pool = require('../config/db');

// 1. Obtener la(s) colonia(s) del Gestor logueado
const getMisColonias = async (req, res) => {
  try {
    const gestor_id = req.user.id; // Viene del token JWT
    
    const result = await pool.query(
      "SELECT * FROM colonias WHERE gestor_id = $1 AND estado = 'activo'",
      [gestor_id]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener mis colonias:", err.message);
    res.status(500).json({ message: "Error al obtener los datos de tu colonia" });
  }
};

// 2. Completar/Actualizar los datos de la colonia (Mapa, descripción...)
const updateColonia = async (req, res) => {
  try {
    const { id } = req.params; // El ID de la colonia
    const { nombre, direccion, descripcion } = req.body;
    const gestor_id = req.user.id;

    // Actualizamos SOLO si la colonia pertenece a este gestor
    const result = await pool.query(
      `UPDATE colonias 
       SET nombre = $1, direccion = $2, descripcion = $3 
       WHERE id = $4 AND gestor_id = $5 
       RETURNING *`,
      [nombre, direccion, descripcion, id, gestor_id]
    );

    // Si no devuelve nada, es que intentó editar una colonia que no es suya
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Colonia no encontrada o acceso denegado" });
    }

    res.json({ message: "¡Colonia actualizada correctamente!", colonia: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar colonia:", err.message);
    res.status(500).json({ message: "Error al guardar los datos" });
  }
};

// 3. Obtener TODAS las colonias para el Mapa Público de la web
const getAllColonias = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM colonias WHERE estado = 'activo'");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al cargar mapa público:", err.message);
    res.status(500).json({ message: "Error al cargar las colonias" });
  }
};

module.exports = { getMisColonias, updateColonia, getAllColonias };