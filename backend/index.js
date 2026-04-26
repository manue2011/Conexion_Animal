require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 1. IMPORTACIÓN DE RUTAS
const coloniaRoutes = require('./routes/coloniaRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const userRoutes = require('./routes/userRoutes');
const animalRoutes = require('./routes/animalRoutes');
const authRoutes = require('./routes/authRoutes');
const adopcionRoutes = require('./routes/adopcionRoutes');
const postsRoutes = require('./routes/postsRoutes');
const necesidadesRoutes = require('./routes/necesidadesRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',                       
  'https://conexion-animal-bice.vercel.app',
  process.env.FRONTEND_URL,                    
].filter(Boolean); 

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS: El origen ' + origin + ' no está permitido.'));
    }
  },
  credentials: true
}));
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de acceso, espera 15 minutos.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json()); 

app.use('/api/colonias', coloniaRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/adopciones', adopcionRoutes);
app.use('/api/necesidades', necesidadesRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Servidor y BD funcionando correctamente',
      time: result.rows[0].now 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});