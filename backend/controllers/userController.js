// Archivo: backend/controllers/userController.js
const pool = require('../config/db');

const solicitarRol = async (req, res) => {
  // Extraemos los datos que nos envía el frontend
  const { rol_solicitado, mensaje } = req.body;
  // El ID del usuario lo sacamos del Token de seguridad, ¡así no pueden falsificarlo!
  const user_id = req.user.id; 

  try {
    // 1. Comprobamos si ya tiene una solicitud pendiente para no saturar la base de datos
    const exist = await pool.query(
      "SELECT * FROM solicitudes_rol WHERE user_id = $1 AND estado = 'pendiente'", 
      [user_id]
    );

    if (exist.rows.length > 0) {
      return res.status(400).json({ message: 'Ya tienes una solicitud en proceso. Por favor, espera a que sea revisada.' });
    }

    // 2. Insertamos la nueva solicitud
    await pool.query(
      "INSERT INTO solicitudes_rol (user_id, rol_solicitado, mensaje) VALUES ($1, $2, $3)",
      [user_id, rol_solicitado, mensaje]
    );

    res.status(201).json({ message: 'Solicitud enviada correctamente' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

module.exports = { solicitarRol };