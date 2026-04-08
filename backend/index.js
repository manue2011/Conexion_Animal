// Archivo: backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Importamos la conexión
const coloniaRoutes = require('./routes/coloniaRoutes');


// Importamos las rutas
const superAdminRoutes = require('./routes/superAdminRoutes');
const userRoutes = require('./routes/userRoutes');
const animalRoutes = require('./routes/animalRoutes');
const authRoutes = require('./routes/authRoutes');
const adopcionRoutes = require('./routes/adopcionRoutes');
const postsRoutes = require('./routes/postsRoutes');

const app = express();

// 1. MIDDLEWARES GLOBALES (¡Siempre van primero!)
app.use(cors());
app.use(express.json()); // Para que el servidor entienda JSON
app.use('/api/colonias', coloniaRoutes);
const animalRoutes = require('./routes/animalRoutes');
app.use(express.json()); // Ahora el servidor ya entiende JSON para todas las rutas de abajo

// 2. RUTAS DE LA API
app.use('/api/posts', postsRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/adopciones', adopcionRoutes);

const necesidadesRoutes = require('./routes/necesidadesRoutes');
app.use('/api/necesidades', necesidadesRoutes);

// 3. RUTA DE PRUEBA (Health Check)
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
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});