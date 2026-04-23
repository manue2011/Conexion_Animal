// Archivo: backend/config/db.js
const { Pool } = require('pg');
// Cargar variables de entorno ANTES de nada
require('dotenv').config(); 

// --- DIAGNÓSTICO
console.log("Intentando conectar con URL:", process.env.DATABASE_URL ? "URL encontrada " : "URL NO ENCONTRADA ");
// ---------------------------------------------------

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("ERROR FATAL: La variable DATABASE_URL no está definida en el archivo .env");
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Conexión a la Base de Datos exitosa');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};