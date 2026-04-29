const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

const enviarCorreoGmailAPI = async ({ to, bcc, replyTo, subject, html }) => {
  try {
    const headers = [
      `From: "Conexión Animal" <${process.env.EMAIL_USER}>`,
      `To: ${Array.isArray(to) ? to.join(',') : to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8'
    ];

    if (bcc) {
      headers.push(`Bcc: ${Array.isArray(bcc) ? bcc.join(',') : bcc}`);
    }

    if (replyTo) {
      headers.push(`Reply-To: ${replyTo}`);
    }

    const message = [
      ...headers,
      '',
      html
    ].join('\r\n');

    const raw = Buffer.from(message, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error en la API de Gmail:', error.message);
    if (error.response?.data) {
      console.error('📨 Detalle Gmail API:', error.response.data);
    }
    throw error;
  }
};

module.exports = { enviarCorreoGmailAPI };