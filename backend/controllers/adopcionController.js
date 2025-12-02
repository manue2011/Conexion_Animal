// Archivo: backend/controllers/adopcionController.js
const pool = require('../config/db');

const crearSolicitud = async (req, res) => {
 const { animal_id, mensaje, telefono, direccion, tiene_jardin, otros_animales } = req.body;
  const solicitante_id = req.user.id;

  try {
    // 1. Verificar si ya solicitó este animal antes (para no duplicar)
    const existe = await pool.query(
      'SELECT * FROM solicitudes_adopcion WHERE animal_id = $1 AND solicitante_id = $2',
      [animal_id, solicitante_id]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Ya has enviado una solicitud para este animal.' });
    }

    // 2. Crear la solicitud
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

// 2. LEER TODAS LAS SOLICITUDES (Para el Admin)
const getSolicitudes = async (req, res) => {
  try {
    // AÑADIDO: s.telefono, s.direccion, s.tiene_jardin, s.otros_animales
    const response = await pool.query(`
      SELECT s.id, s.mensaje, s.estado, s.created_at, 
             s.telefono, s.direccion, s.tiene_jardin, s.otros_animales,
             u.email as solicitante_email,
             a.nombre as animal_nombre, a.foto_url
      FROM solicitudes_adopcion s
      JOIN users u ON s.solicitante_id = u.id
      JOIN animales a ON s.animal_id = a.id
      ORDER BY s.created_at DESC
    `);
    
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
};

// 3. RESPONDER SOLICITUD (Aprobar/Rechazar)
// Archivo: backend/controllers/adopcionController.js

// ... (tus imports y otras funciones)

const updateSolicitud = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; 

  console.log(`➡️ INTENTO DE ACTUALIZAR SOLICITUD ${id} A ESTADO: ${estado}`); // <--- DIAGNÓSTICO 1

  try {
    // 1. Actualizar la solicitud
    const result = await pool.query(
      'UPDATE solicitudes_adopcion SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    
    if (result.rows.length === 0) {
      console.log("❌ Error: No se encontró la solicitud en la BD"); // <--- DIAGNÓSTICO 2
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const solicitudActualizada = result.rows[0];
    console.log("✅ Solicitud actualizada. Datos:", solicitudActualizada); // <--- DIAGNÓSTICO 3

    // 2. LÓGICA DE NEGOCIO
    // ATENCIÓN MANUEL: Fíjate si la terminal imprime "ENTRANDO A ACTUALIZAR ANIMAL..."
    if (estado === 'aprobada') {
      console.log(`🔄 ENTRANDO A ACTUALIZAR ANIMAL ID: ${solicitudActualizada.animal_id}`); // <--- DIAGNÓSTICO 4
      
      const animalResult = await pool.query(
        "UPDATE animales SET estado = 'adoptado' WHERE id = $1 RETURNING *",
        [solicitudActualizada.animal_id]
      );
      
      console.log("Resultado actualización animal:", animalResult.rows[0]); // <--- DIAGNÓSTICO 5
    } else {
      console.log("ℹ️ No se actualiza animal porque el estado no es 'aprobada'");
    }

    res.json({ 
      message: `Solicitud ${estado} correctamente.`, 
      solicitud: solicitudActualizada 
    });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO:", error);
    res.status(500).json({ message: 'Error al actualizar solicitud' });
  }
};

module.exports = { crearSolicitud, getSolicitudes, updateSolicitud };
//exportar las nuevas funciones!