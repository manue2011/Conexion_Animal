require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// 1. Configuramos la clave
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const testEmail = async () => {
    const msg = {
        to: 'graciestela96@gmail.com', // <--- PON TU CORREO AQUÍ PARA PROBAR
        from: 'conexionanimal2026@outlook.com', // <--- TU REMITENTE VERIFICADO
        subject: 'Prueba de Conexión Animal 🐾',
        text: 'Si lees esto, SendGrid está configurado perfectamente.',
        html: '<strong>¡Funciona!</strong> El servidor de Conexión Animal ya puede enviar correos.',
    };

    try {
        console.log('Enviando correo de prueba...');
        await sgMail.send(msg);
        console.log('✅ ¡Correo enviado con éxito! Revisa tu bandeja de entrada (y la de SPAM).');
    } catch (error) {
        console.error('❌ Error al enviar:');
        if (error.response) {
            console.error(error.response.body);
        } else {
            console.error(error);
        }
    }
};

testEmail();