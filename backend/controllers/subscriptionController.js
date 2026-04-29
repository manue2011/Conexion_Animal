const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const getSubscriptionStatus = async (req, res) => {
  const userId = req.user.id; 

  try {
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

    const postsCount = await pool.query(
      "SELECT COUNT(*)::INT FROM posts WHERE publicador_id = $1 AND estado != 'rejected'",
      [userId] 
    );
    const usedPosts = postsCount.rows[0].count;

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
          messages: { 
            used: usedPosts,
            max: null, 
            percentage: 0
          }
        },
        features: ["Animales ilimitados", "Acceso total Solidario", "Gestión de Colonia"],
        message: "Las colonias tienen acceso total gratuito por su labor social."
      });
    }

   
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
const createCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email,
      client_reference_id: req.user.id, 
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Conexión Animal - Plan Pro 🐾',
            description: 'Animales ilimitados, posts ilimitados y soporte prioritario.'
          },
          unit_amount: 999, // 9.99€ en céntimos
          recurring: { interval: 'month' }
        },
        quantity: 1
      }],
      success_url: `${FRONTEND_URL}/admin/dashboard?plan=success`,
      cancel_url: `${FRONTEND_URL}/admin/dashboard?plan=cancelled`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creando sesión Stripe:", err);
    res.status(500).json({ message: "Error al iniciar el proceso de pago." });
  }
};

// 3. NUEVA: Recibir el aviso de pago completado (Webhook)
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook Error de firma:", err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    try {
      await pool.query("UPDATE users SET plan = 'pro' WHERE id = $1", [userId]);
      console.log(`✅ ¡ÉXITO! Usuario ${userId} actualizado a Plan Pro`);
    } catch (dbErr) {
      console.error("Error al actualizar la base de datos en webhook:", dbErr);
    }
  }

  res.json({ received: true });
};

module.exports = { getSubscriptionStatus, createCheckoutSession, handleStripeWebhook };