const pool = require('../config/db');

// Obtener todas las solicitudes de rol pendientes
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

// 3. Procesar la solicitud (El motor principal)
const procesarSolicitud = async (req, res) => {
  const { id } = req.params; 
  // Capturamos lo que nos manda el Modal de React:
  const { accion, vinculoModo, entidadId, entidadNombre } = req.body; 

  try {
    await pool.query('BEGIN'); // Iniciamos transacción segura

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
      
      // 0. Sacamos el teléfono del usuario por si nos hace falta copiarlo
      const userResult = await pool.query('SELECT telefono FROM users WHERE id = $1', [userId]);
      const telefonoUsuario = userResult.rows[0]?.telefono || null;

      // 🏢 LÓGICA PARA PROTECTORAS (Rol: admin)
      if (rol === 'admin') {
        let idProtectora = entidadId; // Si es 'existente', usamos el ID que viene de React

        if (vinculoModo === 'nueva') {
          // 1. Creamos la protectora inyectando el nombre Y EL TELÉFONO
          const nuevaProt = await pool.query(
            "INSERT INTO protectoras (nombre, telefono) VALUES ($1, $2) RETURNING id",
            [entidadNombre, telefonoUsuario]
          );
          idProtectora = nuevaProt.rows[0].id;
        }

        // 2. Vinculamos al usuario con la protectora en la tabla puente (N:M)
        await pool.query(
          "INSERT INTO protectora_admins (user_id, protectora_id) VALUES ($1, $2)",
          [userId, idProtectora]
        );
      } 
      
      // 🐱 LÓGICA PARA COLONIAS (Rol: gestor)
      else if (rol === 'gestor') {
        if (vinculoModo === 'nueva') {
          // En tu BD, el gestor_id va directamente en la tabla de la colonia
          await pool.query(
            "INSERT INTO colonias (nombre, gestor_id) VALUES ($1, $2)",
            [entidadNombre, userId]
          );
        } else if (vinculoModo === 'existente') {
          // Si te vinculan a una existente, te pisa como el nuevo gestor
          await pool.query(
            "UPDATE colonias SET gestor_id = $1 WHERE id = $2",
            [userId, entidadId]
          );
        }
      }

      // 3. Ascendemos al usuario y lo desbloqueamos (verificado = true)
      await pool.query(
        "UPDATE users SET role = $1, verificado = true WHERE id = $2", 
        [rol, userId]
      );

      // 4. Marcamos la solicitud como aprobada
      await pool.query("UPDATE solicitudes_rol SET estado = 'aprobado' WHERE id = $1", [id]);
      
      await pool.query('COMMIT'); // Guardamos todo definitivamente
      return res.json({ message: `¡Usuario ascendido y vinculado con éxito!` });
    }

    await pool.query('ROLLBACK');
    res.status(400).json({ message: 'Acción no válida' });

  } catch (err) {
    await pool.query('ROLLBACK'); // Si algo peta, no se guarda nada a medias
    console.error('Error al procesar solicitud:', err);
    res.status(500).json({ message: 'Error en el servidor al procesar la solicitud' });
  }
};

// Obtener las listas para los desplegables del SuperAdmin
const getEntidadesExistentes = async (req, res) => {
  try {
    // Sacamos las protectoras
    const protectoras = await pool.query("SELECT id, nombre FROM protectoras WHERE estado = 'activo' ORDER BY nombre ASC");
    
    // Sacamos las colonias
    const colonias = await pool.query("SELECT id, nombre FROM colonias WHERE estado = 'activo' ORDER BY nombre ASC");

    // Lo enviamos todo junto a React
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
        (SELECT COUNT(*)::INT FROM users) as usuarios_totales,
        (SELECT COUNT(*)::INT FROM protectoras WHERE estado = 'activo') as protectoras_activas,
        (SELECT COUNT(*)::INT FROM colonias WHERE estado = 'activo') as colonias_activas,
        (SELECT COUNT(*)::INT FROM users WHERE role = 'user') as usuarios_normales,

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
  const { tipo, id } = req.params; // tipo: 'protectoras' o 'colonias'
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

// Obtener lista de todos los SuperAdmins actuales
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
  // .trim() elimina espacios accidentales al principio o final
  const email = req.body.email ? req.body.email.trim() : null;

  if (!email) {
    return res.status(400).json({ message: "El email es obligatorio" });
  }

  try {
    // Usamos ILIKE para que no importe si escribes Mayúsculas o Minúsculas
    const result = await pool.query(
      "UPDATE users SET role = 'superadmin', verificado = true WHERE email ILIKE $1 RETURNING id, email, role",
      [email]
    );

    // Si rowCount es 0, es que ese email NO existe en la tabla 'users'
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



module.exports = { getPendingRequests, getEntidadesExistentes, procesarSolicitud, obtenerMetricasGlobales, obtenerListadoEntidades, actualizarEntidad, obtenerStaff, asignarSuperAdmin };