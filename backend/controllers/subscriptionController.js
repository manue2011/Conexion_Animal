const pool = require('../config/db');

const getSubscriptionStatus = async (req, res) => {
  const userId = req.user.id; // Este es el ID del usuario (UUID)

  try {
    // 1. Buscamos el usuario y sus relaciones
    const userResult = await pool.query(
      `SELECT u.plan, u.role, 
        (SELECT protectora_id FROM protectora_admins WHERE user_id = u.id LIMIT 1) as protectora_id,
        (SELECT id FROM colonias WHERE gestor_id = u.id LIMIT 1) as colonia_id
       FROM users u WHERE u.id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    // 2. CONTEO DE MENSAJES (Para todos)
    // Usamos userId porque en tu SQL 'publicador_id' es el ID del usuario
    const postsCount = await pool.query(
      "SELECT COUNT(*)::INT FROM posts WHERE publicador_id = $1 AND estado != 'rejected'",
      [userId] 
    );
    const usedPosts = postsCount.rows[0].count;

    // 3. LÓGICA DE RESPUESTA
    
    // CASO A: COLONIAS (Gestores)
    if (user.role === 'gestor' || user.colonia_id) {
      const animalsCount = await pool.query(
        "SELECT COUNT(*)::INT FROM animales WHERE colonia_id = $1 AND estado = 'activo'",
        [user.colonia_id]
      );

      return res.json({
        tipoEntidad: 'colonia',
        plan: 'comunidad_solidaria',
        isPro: true, 
        limits: {
          animals: {
            used: animalsCount.rows[0].count,
            max: null,
            percentage: 0
          },
          messages: { // <--- AHORA SÍ SE INCLUYE EN COLONIAS
            used: usedPosts,
            max: null, // O el límite que quieras para colonias
            percentage: 0
          }
        },
        features: ["Animales ilimitados", "Acceso total Solidario", "Gestión de Colonia"],
        message: "Las colonias tienen acceso total gratuito por su labor social."
      });
    }

    // CASO B: PROTECTORAS (Admins)
    const isPro = user.plan === 'pro';
    let animalCount = 0;

    if (user.protectora_id) {
      const countRes = await pool.query(
        "SELECT COUNT(*)::INT FROM animales WHERE protectora_id = $1 AND estado = 'activo'",
        [user.protectora_id]
      );
      animalCount = countRes.rows[0].count;
    }

    return res.json({
      tipoEntidad: 'protectora',
      plan: user.plan,
      isPro: isPro,
      limits: {
        animals: {
          used: animalCount,
          max: isPro ? null : 50,
          percentage: isPro ? 0 : Math.round((animalCount / 50) * 100)
        },
        messages: {
          used: usedPosts,
          max: isPro ? null : 20,
          percentage: isPro ? 0 : Math.round((usedPosts / 20) * 100)
        } 
      },
      features: isPro 
        ? ["Animales ilimitados", "Sello de Protectora Verificada", "Alertas prioritarias", "Soporte 24/7"]
        : ["Límite de 50 animales", "Publicaciones estándar", "Soporte por email"]
    });

  } catch (error) {
    console.error("ERROR EN EL CONTROLADOR:", error);
    res.status(500).json({ message: 'Error en el servidor', detail: error.message });
  }
};

module.exports = { getSubscriptionStatus };