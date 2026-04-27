const pool = require('../config/db');

const crearSolicitud = async (req, res) => {
  const { animal_id, mensaje, telefono, direccion, tiene_jardin, otros_animales } = req.body;
  const solicitante_id = req.user.id;

  try {
    const existe = await pool.query(
      'SELECT * FROM solicitudes_adopcion WHERE animal_id = $1 AND solicitante_id = $2',
      [animal_id, solicitante_id]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Ya has enviado una solicitud para este animal.' });
    }

    await pool.query(
      `INSERT INTO solicitudes_adopcion 
       (animal_id, solicitante_id, mensaje, telefono, direccion, tiene_jardin, otros_animales) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [animal_id, solicitante_id, mensaje, telefono, direccion, tiene_jardin || false, otros_animales]
    );

    res.status(201).json({ message: '¡Formulario enviado! La protectora analizará tu perfil.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

 
const getSolicitudes = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
   
    let query = `
      SELECT s.id, s.mensaje, s.estado, s.created_at, 
             s.telefono, s.direccion, s.tiene_jardin, s.otros_animales,
             u.email as solicitante_email,
             a.nombre as animal_nombre, a.foto_url
      FROM solicitudes_adopcion s
      JOIN users u ON s.solicitante_id = u.id
      JOIN animales a ON s.animal_id = a.id
    `;
    let params = [];

  
    if (userRole === 'admin') {
      // Si es Admin de Protectora: Solo ve animales de SU protectora
      query += ` 
        JOIN protectora_admins pa ON a.protectora_id = pa.protectora_id
        WHERE pa.user_id = $1
      `;
      params = [userId];
    } 
    else if (userRole === 'gestor') {
      // Si es Gestor de Colonia: Solo ve animales de SU colonia
      query += ` 
        JOIN colonias c ON a.colonia_id = c.id
        WHERE c.gestor_id = $1
      `;
      params = [userId];
    } 
    else if (userRole === 'superadmin') {
      // El SuperAdmin no tiene WHERE, lo ve todo
    } 
    else {
      // Si no es ninguno, no debería ver nada
      return res.status(403).json({ message: 'No tienes permiso para ver solicitudes' });
    }

    query += " ORDER BY s.created_at DESC";
    
    const response = await pool.query(query, params);
    res.json(response.rows);

  } catch (error) {
    console.error("Error en getSolicitudes:", error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
};

// 3. RESPONDER SOLICITUD (Aprobar/Rechazar)
const updateSolicitud = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; 

  try {
    const result = await pool.query(
      'UPDATE solicitudes_adopcion SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const solicitudActualizada = result.rows[0];

    if (estado === 'aprobada') {
      await pool.query(
        "UPDATE animales SET estado = 'adoptado' WHERE id = $1",
        [solicitudActualizada.animal_id]
      );
    }

    res.json({ 
      message: `Solicitud ${estado} correctamente.`, 
      solicitud: solicitudActualizada 
    });

  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    res.status(500).json({ message: 'Error al actualizar solicitud' });
  }
};
const getMisSolicitudes = async (req, res) => {
  try {
    const solicitante_id = req.user.id;
    const result = await pool.query(
      `SELECT s.*, a.nombre as animal_nombre 
       FROM solicitudes_adopcion s 
       JOIN animales a ON s.animal_id = a.id 
       WHERE s.solicitante_id = $1 
       ORDER BY s.created_at DESC`, 
      [solicitante_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener tus solicitudes" });
  }
};

module.exports = { crearSolicitud, getSolicitudes, updateSolicitud, getMisSolicitudes };