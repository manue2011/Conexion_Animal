const pool = require('../config/db');

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

const updateColonia = async (req, res) => {
  try {
    const { id } = req.params; 
    const { nombre, direccion, descripcion } = req.body;
    const gestor_id = req.user.id;

    const result = await pool.query(
      `UPDATE colonias 
       SET nombre = $1, direccion = $2, descripcion = $3 
       WHERE id = $4 AND gestor_id = $5 
       RETURNING *`,
      [nombre, direccion, descripcion, id, gestor_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Colonia no encontrada o acceso denegado" });
    }

    res.json({ message: "¡Colonia actualizada correctamente!", colonia: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar colonia:", err.message);
    res.status(500).json({ message: "Error al guardar los datos" });
  }
};

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