const pool = require('../config/db'); // Ajusta la ruta a tu archivo de conexión DB
const bcrypt = require('bcryptjs');

const createSuperAdmin = async () => {
  const email = 'reyesmanuelzarate@hotmail.com';
  const password = 'hola'; // La que usarás para entrar
  const saltRounds = 10;

  try {
    // 1. Encriptamos la contraseña
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Insertamos en la base de datos
    const query = `
      INSERT INTO users (email, password_hash, role, verificado)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, role;
    `;

    const values = [email, hashedPassword, 'superadmin', true];
    const res = await pool.query(query, values);

    console.log('✅ SuperAdmin creado con éxito:');
    console.table(res.rows[0]);
    process.exit();

  } catch (err) {
    console.error('❌ Error al crear SuperAdmin:', err.message);
    process.exit(1);
  }
};

createSuperAdmin();