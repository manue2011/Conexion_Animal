const pool = require('../config/db');
const sgMail = require('@sendgrid/mail');

// Configuramos SendGrid con la clave que pondremos en el archivo .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const crearNecesidad = async (req, res) => {
  const { titulo, descripcion, categoria, prioridad, protectora_id, colonia_id } = req.body;
  const publicador_id = req.user.id; // Obtenido del token

  try {
    // 1. Guardamos la necesidad en la Base de Datos
    const result = await pool.query(
      `INSERT INTO necesidades 
      (publicador_id, protectora_id, colonia_id, titulo, descripcion, categoria, prioridad) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [publicador_id, protectora_id || null, colonia_id || null, titulo, descripcion, categoria, prioridad]
    );

    // 2. SISTEMA DE ALERTAS (SendGrid)
    // Si la prioridad es "urgente", disparamos el correo.
   // 2. SISTEMA DE ALERTAS (SendGrid)
    // Si la prioridad es "urgente", buscamos a los voluntarios y disparamos
   // 2. SISTEMA DE ALERTAS (SendGrid)
    if (prioridad === 'urgente') {
      try {
        // --- NUEVO: BUSCAR DATOS DE LA ENTIDAD ---
        let nombreEntidad = "Entidad no especificada";
        let direccionEntidad = "Dirección no disponible";
        let contactoEntidad = "Contactar por la plataforma";

       if (protectora_id) {
          // 1. Eliminamos 'email' de la consulta SQL
          const protData = await pool.query('SELECT nombre, direccion, telefono FROM protectoras WHERE id = $1', [protectora_id]);
          if (protData.rows.length > 0) {
            const p = protData.rows[0];
            nombreEntidad = `🏢 Protectora: ${p.nombre}`;
            direccionEntidad = p.direccion;
            // 2. Mostramos únicamente el teléfono
            contactoEntidad = `📞 ${p.telefono || 'Sin tel. registrado'}`;
          }
        } else if (colonia_id) {
          const colData = await pool.query(`
            SELECT c.nombre, c.direccion, u.telefono, u.email 
            FROM colonias c 
            JOIN users u ON c.gestor_id = u.id 
            WHERE c.id = $1
          `, [colonia_id]);
          
          if (colData.rows.length > 0) {
            const c = colData.rows[0];
            nombreEntidad = `🐱 Colonia: ${c.nombre}`;
            direccionEntidad = c.direccion;
            contactoEntidad = `📞 ${c.telefono || 'Sin tel.'} | ✉️ ${c.email || ''}`;
          }
        }

        // --- BUSCAR VOLUNTARIOS Y ENVIAR ---
        const voluntariosResult = await pool.query("SELECT email FROM users WHERE role = 'user'");
        const correosVoluntarios = voluntariosResult.rows.map(v => v.email);

        if (correosVoluntarios.length > 0) {
          const msg = {
            to: 'conexionanimal2026@outlook.com', //  mi correo
            bcc: correosVoluntarios, //  Copia  a todos los voluntarios
            from:'conexionanimal2026@outlook.com', //  Tu correo verificado
            subject: `🚨 ALERTA URGENTE: ${titulo}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444; text-align: center;">¡Se requiere ayuda inmediata! 🐾</h2>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; color: #1e293b;">📍 ¿Dónde se necesita?</h3>
                  <p style="margin: 5px 0;"><strong>${nombreEntidad}</strong></p>
                  <p style="margin: 5px 0;"><strong>🗺️ Ubicación:</strong> ${direccionEntidad}</p>
                  <p style="margin: 5px 0;"><strong>📞 Contacto:</strong> ${contactoEntidad}</p>
                </div>

                <p><strong>Categoría:</strong> ${categoria.toUpperCase()}</p>
                <p><strong>Detalle de la emergencia:</strong></p>
                <p style="background-color: #fef2f2; padding: 15px; border-radius: 5px; font-size: 16px;">${descripcion}</p>
                
                <hr style="border: 1px solid #fee2e2; margin: 25px 0;" />
                <p style="font-size: 12px; color: #6b7280; text-align: center;">
                  Has recibido este email porque eres parte de la red de voluntarios de Conexión Animal. Si puedes ayudar, contacta directamente con la entidad usando los datos de arriba.
                </p>
              </div>
            `,
          };

          await sgMail.send(msg);
          console.log(`📧 ¡Alerta disparada a ${correosVoluntarios.length} voluntarios!`);
        }
      } catch (emailErr) {
        console.error("❌ Error en el sistema de alertas:", emailErr.response?.body || emailErr.message);
      }
    }

    res.status(201).json({ 
      message: "¡Necesidad publicada! Si marcaste urgencia, la alerta ha sido enviada.", 
      necesidad: result.rows[0] 
    });

  } catch (err) {
    console.error("Error al crear necesidad:", err.message);
    res.status(500).json({ message: "Error al publicar la petición de ayuda" });
  }
};

module.exports = { crearNecesidad };