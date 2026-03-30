const pool = require('../config/db');

// Obtener todas las solicitudes de rol pendientes
const getPendingRequests = async (req, res) => {
  try {
    // Hacemos un JOIN para unir la solicitud con el correo del usuario
    const query = `
      SELECT 
        sr.id, 
        sr.rol_solicitado, 
        sr.mensaje, 
        sr.estado, 
        u.email 
      FROM solicitudes_rol sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.estado = 'pendiente'
      ORDER BY sr.created_at ASC;
    `;
    
    const result = await pool.query(query);
    res.json(result.rows); // Devolvemos el array de solicitudes al frontend
    
  } catch (err) {
    console.error('Error en getPendingRequests:', err.message);
    res.status(500).json({ message: 'Error al obtener las solicitudes pendientes' });
  }
};
// Añade esta función en superAdminController.js
const procesarSolicitud = async (req, res) => {
  const { id } = req.params; // El ID de la solicitud
  const { accion } = req.body; // 'aprobar' o 'rechazar'

  try {
    // 1. Buscamos la solicitud para saber qué rol pidió y quién es
    const solicitudResult = await pool.query('SELECT * FROM solicitudes_rol WHERE id = $1', [id]);
    
    if (solicitudResult.rows.length === 0) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudResult.rows[0];

    if (accion === 'rechazar') {
      // Solo cambiamos el estado a rechazado
      await pool.query("UPDATE solicitudes_rol SET estado = 'rechazado' WHERE id = $1", [id]);
      return res.json({ message: 'Solicitud rechazada correctamente' });
    }

    if (accion === 'aprobar') {
      // A. Cambiamos la solicitud a aprobada
      await pool.query("UPDATE solicitudes_rol SET estado = 'aprobado' WHERE id = $1", [id]);
      
      // B. ¡EL ASCENSO! Le cambiamos el rol al usuario en la tabla users
      await pool.query("UPDATE users SET role = $1 WHERE id = $2", [solicitud.rol_solicitado, solicitud.user_id]);
      
      return res.json({ message: `¡Usuario ascendido a ${solicitud.rol_solicitado} con éxito!` });
    }

    res.status(400).json({ message: 'Acción no válida' });

  } catch (err) {
    console.error('Error al procesar solicitud:', err.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { getPendingRequests, procesarSolicitud };

