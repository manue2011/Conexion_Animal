// controllers/subscriptionController.js (Ajustado)

const getSubscriptionStatus = async (req, res) => {
  const userId = req.user.id;

  try {
    const userResult = await pool.query(
      `SELECT u.plan, u.role, 
       (SELECT id FROM protectoras WHERE id_responsable = u.id LIMIT 1) as protectora_id,
       (SELECT id FROM colonias WHERE id_gestor = u.id LIMIT 1) as colonia_id
       FROM users u WHERE u.id = $1`,
      [userId]
    );
    
    const user = userResult.rows[0];

    // Si es un gestor de colonia, su plan es SIEMPRE ilimitado (o un "Free" sin límites)
    // porque no queremos cobrarles por ayudar.
    if (user.colonia_id) {
      return res.json({
        tipoEntidad: 'colonia',
        plan: 'comunidad_solidaria',
        isPro: true, // Les damos funciones "pro" gratis
        message: "Las colonias tienen acceso total gratuito por su labor social."
      });
    }

    // Si es una protectora, aplicamos la lógica de negocio
    const isPro = user.plan === 'pro';
    const animalsCount = await pool.query(
      "SELECT COUNT(*) FROM animales WHERE protectora_id = $1",
      [user.protectora_id]
    );

    res.json({
      tipoEntidad: 'protectora',
      plan: user.plan,
      isPro: isPro,
      usage: {
        animals: parseInt(animalsCount.rows[0].count),
        limit: isPro ? 'Ilimitado' : 50
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};