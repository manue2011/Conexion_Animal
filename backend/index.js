// Archivo: backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Importamos la conexión
const coloniaRoutes = require('./routes/coloniaRoutes');
const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json()); // Para que el servidor entienda JSON
app.use('/api/colonias', coloniaRoutes);
const animalRoutes = require('./routes/animalRoutes');
app.use('/api/animales', animalRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const adopcionRoutes = require('./routes/adopcionRoutes');
app.use('/api/adopciones', adopcionRoutes);

// Ruta de prueba (Health Check)
app.get('/health', async (req, res) => {
  try {
    // Hacemos una consulta simple para ver si la BD responde
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
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});