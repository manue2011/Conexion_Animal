const pool = require('../config/db');


const getPendingRequests = async (req, res) => {
  try {
    const query = `
      SELECT 
        sr.id, 
        sr.rol_solicitado, 
        sr.mensaje, 
        sr.estado, 
        u.email,
        u.telefono,             
        u.entidad_solicitada    
      FROM solicitudes_rol sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.estado = 'pendiente'
      ORDER BY sr.created_at ASC;
    `;
    
    const result = await pool.query(query);
    res.json(result.rows); 
    
  } catch (err) {
    console.error('Error en getPendingRequests:', err.message);
    res.status(500).json({ message: 'Error al obtener las solicitudes pendientes' });
  }
};

const procesarSolicitud = async (req, res) => {
  const { id } = req.params; 
  const { accion, vinculoModo, entidadId, entidadNombre } = req.body; 

  try {
    await pool.query('BEGIN'); 

    const solicitudResult = await pool.query('SELECT * FROM solicitudes_rol WHERE id = $1', [id]);
    if (solicitudResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudResult.rows[0];
    const userId = solicitud.user_id;
    const rol = solicitud.rol_solicitado;

    // --- CASO A: RECHAZAR ---
    if (accion === 'rechazar') {
      await pool.query("UPDATE solicitudes_rol SET estado = 'rechazado' WHERE id = $1", [id]);
      await pool.query('COMMIT');
      return res.json({ message: 'Solicitud rechazada correctamente' });
    }

    // --- CASO B: APROBAR 
    if (accion === 'aprobar') {
      
    
      const userResult = await pool.query('SELECT telefono FROM users WHERE id = $1', [userId]);
      const telefonoUsuario = userResult.rows[0]?.telefono || null;

      if (rol === 'admin') {
        let idProtectora = entidadId; 

        if (vinculoModo === 'nueva') {
          const nuevaProt = await pool.query(
            "INSERT INTO protectoras (nombre, telefono) VALUES ($1, $2) RETURNING id",
            [entidadNombre, telefonoUsuario]
          );
          idProtectora = nuevaProt.rows[0].id;
        }

        await pool.query(
          "INSERT INTO protectora_admins (user_id, protectora_id) VALUES ($1, $2)",
          [userId, idProtectora]
        );
      } 
      
      else if (rol === 'gestor') {
        if (vinculoModo === 'nueva') {
          await pool.query(
            "INSERT INTO colonias (nombre, gestor_id) VALUES ($1, $2)",
            [entidadNombre, userId]
          );
        } else if (vinculoModo === 'existente') {
          await pool.query(
            "UPDATE colonias SET gestor_id = $1 WHERE id = $2",
            [userId, entidadId]
          );
        }
      }

      await pool.query(
        "UPDATE users SET role = $1, verificado = true WHERE id = $2", 
        [rol, userId]
      );

      await pool.query("UPDATE solicitudes_rol SET estado = 'aprobado' WHERE id = $1", [id]);
      
      await pool.query('COMMIT'); 
      return res.json({ message: `¡Usuario ascendido y vinculado con éxito!` });
    }

    await pool.query('ROLLBACK');
    res.status(400).json({ message: 'Acción no válida' });

  } catch (err) {
    await pool.query('ROLLBACK'); 
    console.error('Error al procesar solicitud:', err);
    res.status(500).json({ message: 'Error en el servidor al procesar la solicitud' });
  }
};

const getEntidadesExistentes = async (req, res) => {
  try {
    // Sacamos las protectoras
    const protectoras = await pool.query("SELECT id, nombre FROM protectoras WHERE estado = 'activo' ORDER BY nombre ASC");
    
    // Sacamos las colonias
    const colonias = await pool.query("SELECT id, nombre FROM colonias WHERE estado = 'activo' ORDER BY nombre ASC");

    res.json({
      protectoras: protectoras.rows,
      colonias: colonias.rows
    });
  } catch (err) {
    console.error('Error al obtener entidades:', err.message);
    res.status(500).json({ message: 'Error al obtener las listas' });
  }
};
const obtenerMetricasGlobales = async (req, res) => {
  try {
    const query = `
      SELECT 
        -- 1. ECOSISTEMA Y CRECIMIENTO
        (SELECT COUNT(*)::INT FROM users WHERE verificado = true) as usuarios_totales,
        (SELECT COUNT(*)::INT FROM protectoras WHERE estado = 'activo') as protectoras_activas,
        (SELECT COUNT(*)::INT FROM colonias WHERE estado = 'activo') as colonias_activas,
        (SELECT COUNT(*)::INT FROM users WHERE role = 'user' AND verificado = true) as usuarios_normales,
        (SELECT COUNT(*)::INT FROM users WHERE plan = 'pro' AND verificado = true) as suscripciones_pro,

        -- 2. IMPACTO SOCIAL (DATOS REALES)
        (SELECT COUNT(*)::INT FROM animales WHERE estado = 'adoptado') as adopciones_totales,
        (SELECT COUNT(*)::INT FROM necesidades WHERE prioridad = 'urgente') as alertas_enviadas,
        (SELECT COUNT(*)::INT FROM animales WHERE estado = 'activo') as animales_buscando,

        -- 3. GOBERNANZA Y SEGURIDAD
        (SELECT COUNT(*)::INT FROM solicitudes_rol WHERE estado = 'pendiente') as solicitudes_pendientes,
        (SELECT COUNT(*)::INT FROM posts WHERE estado = 'pending') as posts_pendientes
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error en obtenerMetricasGlobales:", error.message);
    res.status(500).json({ error: "Error al obtener las métricas globales" });
  }
};

const obtenerListadoEntidades = async (req, res) => {
  try {
    // 1. Traemos protectoras con el conteo de sus admins
    const protectoras = await pool.query(`
      SELECT p.*, COUNT(pa.user_id)::INT as total_admins 
      FROM protectoras p 
      LEFT JOIN protectora_admins pa ON p.id = pa.protectora_id 
      GROUP BY p.id ORDER BY p.created_at DESC
    `);

    // 2. Traemos colonias con el email de su gestor
    const colonias = await pool.query(`
      SELECT c.*, u.email as gestor_email 
      FROM colonias c 
      JOIN users u ON c.gestor_id = u.id 
      ORDER BY c.created_at DESC
    `);

    res.json({
      protectoras: protectoras.rows,
      colonias: colonias.rows
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el listado maestro" });
  }
};
const actualizarEntidad = async (req, res) => {
  const { tipo, id } = req.params; 
  const { nombre, direccion, descripcion, estado, codigo_postal } = req.body;

  try {
    let query;
    let params;

    if (tipo === 'protectoras') {
      query = `UPDATE protectoras SET nombre = $1, direccion = $2, descripcion = $3, estado = $4 WHERE id = $5 RETURNING *`;
      params = [nombre, direccion, descripcion, estado, id];
    } else {
      query = `UPDATE colonias SET nombre = $1, direccion = $2, descripcion = $3, estado = $4, codigo_postal = $5 WHERE id = $6 RETURNING *`;
      params = [nombre, direccion, descripcion, estado, codigo_postal, id];
    }

    const result = await pool.query(query, params);
    res.json({ message: "Entidad actualizada", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la entidad" });
  }
};

const obtenerStaff = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, created_at FROM users WHERE role = 'superadmin' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el staff" });
  }
};
const asignarSuperAdmin = async (req, res) => {
  const email = req.body.email ? req.body.email.trim() : null;

  if (!email) {
    return res.status(400).json({ message: "El email es obligatorio" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = 'superadmin', verificado = true WHERE email ILIKE $1 RETURNING id, email, role",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ 
        message: `No se encontró ningún usuario con el email: ${email}. Asegúrate de que se haya registrado primero.` 
      });
    }

    res.json({ message: "Nuevo SuperAdmin asignado", user: result.rows[0] });
  } catch (error) {
    console.error("Error en asignarSuperAdmin:", error.message);
    res.status(500).json({ error: "Error al procesar la solicitud en la base de datos" });
  }
};
const obtenerUsuariosPro = async (req, res) => {
  try {
    const query = `
      SELECT id, email, role, created_at, plan
      FROM users 
      WHERE plan = 'pro'
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener usuarios PRO:", error.message);
    res.status(500).json({ error: "Error al obtener la lista de usuarios PRO" });
  }
};



const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, estado, created_at 
       FROM users 
       WHERE verificado = true
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

const toggleBanUsuario = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; 
  try {
    await pool.query(
      `UPDATE users SET estado = $1 WHERE id = $2 AND role != 'superadmin'`,
      [estado, id]
    );
    res.json({ message: `Usuario ${estado} correctamente.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar estado del usuario' });
  }
};
module.exports = { getPendingRequests, getEntidadesExistentes, procesarSolicitud, obtenerMetricasGlobales, obtenerListadoEntidades, actualizarEntidad, obtenerStaff, asignarSuperAdmin, obtenerUsuariosPro, getUsuarios, toggleBanUsuario };