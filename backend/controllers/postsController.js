const pool = require('../config/db');

// ============================================================================
// 1. CREAR POST (Usuarios, Gestores, Admins)
// ============================================================================
const crearPost = async (req, res) => {
  const { titulo, contenido, categoria, prioridad,codigo_postal} = req.body;
  const publicador_id = req.user.id; // Viene del token JWT
  const userRole = req.user.role;    // Viene del token JWT
  const userPlan = req.user.plan;    // Para el modelo Freemium futuro

  try {
    let prioridadFinal = 'normal';

    // Lógica de negocio: Solo ciertos usuarios pueden crear posts "destacados"
    if (prioridad === 'destacado') {
      if (userRole === 'gestor' || userRole === 'admin' || userPlan === 'pro') {
        prioridadFinal = 'destacado';
      }
      // Si un usuario normal intenta enviarlo como destacado, 
      // lo forzamos a 'normal' silenciosamente sin romper la app.
    }

    // El estado SIEMPRE se fuerza a 'pending' a nivel de backend por seguridad
    const result = await pool.query(
      `INSERT INTO posts (publicador_id, titulo, contenido, categoria, prioridad, estado, codigo_postal) 
       VALUES ($1, $2, $3, $4, $5, 'pending', $6) RETURNING *`,
      [publicador_id, titulo, contenido, categoria, prioridadFinal, codigo_postal]
    );

    res.status(201).json({ 
      message: "Publicación enviada. Será visible cuando un moderador la apruebe.", 
      post: result.rows[0] 
    });

  } catch (error) {
    console.error("Error al crear post:", error.message);
    res.status(500).json({ error: "Error interno al enviar la publicación" });
  }
};

// ============================================================================
// 2. OBTENER TABLÓN PÚBLICO (El Escaparate)
// ============================================================================
const obtenerTablon = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.titulo, p.contenido, p.categoria, p.prioridad, p.created_at, p.codigo_postal, 
             u.entidad_solicitada as nombre_autor,
             u.email as autor_email,
             u.telefono as autor_telefono
      FROM posts p
      JOIN users u ON p.publicador_id = u.id
      WHERE p.estado = 'approved'
      ORDER BY p.prioridad = 'destacado' DESC, p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al cargar el tablón:", error.message);
    res.status(500).json({ error: "Error al cargar las publicaciones" });
  }
};

// ============================================================================
// 3. OBTENER POSTS (Pendientes o Aprobados para el Superadmin)
// ============================================================================
const obtenerPendientes = async (req, res) => {
  // Capturamos el estado de la URL (query string)
  const { estado } = req.query; 
  const filtroEstado = estado || 'pending';

  console.log("🔍 SuperAdmin consultando posts con estado:", filtroEstado);

  try {
    const result = await pool.query(`
      SELECT p.*, u.email as autor_email 
      FROM posts p
      JOIN users u ON p.publicador_id = u.id
      WHERE p.estado = $1
      ORDER BY p.created_at DESC
    `, [filtroEstado]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error en obtenerPendientes:", error.message);
    res.status(500).json({ error: "Error al cargar la cola de moderación" });
  }
};
// ============================================================================
// 4. MODERAR POST (Solo Admins)
// ============================================================================
const moderarPost = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body; // Esperamos 'approved' o 'rejected'

  if (!['approved', 'rejected'].includes(nuevoEstado)) {
    return res.status(400).json({ error: "Estado no válido. Usa 'approved' o 'rejected'." });
  }

  try {
    const result = await pool.query(
      `UPDATE posts SET estado = $1 WHERE id = $2 RETURNING *`,
      [nuevoEstado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada." });
    }

    res.json({ 
      message: `La publicación ha sido marcada como ${nuevoEstado}.`, 
      post: result.rows[0] 
    });
  } catch (error) {
    console.error("Error al moderar post:", error.message);
    res.status(500).json({ error: "Error interno al actualizar el estado" });
  }
};

module.exports = {
  crearPost,
  obtenerTablon,
  obtenerPendientes,
  moderarPost,
};