const { Client } = require('pg');
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

const sendStatusUpdateNotification = async (requestData) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email configuration missing, skipping email notification');
      return false;
    }

    const transporter = createTransporter();

    const subject = requestData.status === 'approved'
      ? 'Votre demande de changement de spécialité a été approuvée'
      : 'Votre demande de changement de spécialité a été rejetée';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${subject}</h2>

        <p>Cher(e) ${requestData.prenom} ${requestData.nom},</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Détails de votre demande:</h3>
          <p><strong>Matricule:</strong> ${requestData.matricule}</p>
          <p><strong>Spécialité actuelle:</strong> ${requestData.specialite_actuelle}</p>
          <p><strong>Spécialité souhaitée:</strong> ${requestData.specialite_souhaitee}</p>
          <p><strong>Statut:</strong>
            <span style="color: ${requestData.status === 'approved' ? '#16a34a' : '#dc2626'}; font-weight: bold;">
              ${requestData.status === 'approved' ? 'APPROUVÉE' : 'REJETÉE'}
            </span>
          </p>
          ${requestData.adminComment ? `<p><strong>Commentaire de l'administrateur:</strong> ${requestData.adminComment}</p>` : ''}
        </div>

        <p>Cordialement,<br>L'équipe administrative USTHB</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: requestData.email,
      subject,
      html
    });

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check for required environment variables
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is missing');
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Database configuration missing' })
    };
  }

  let client;
  try {
    const requestBody = JSON.parse(event.body);
    const { id, status, adminComment, adminName } = requestBody;

    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request data' })
      };
    }

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Update the request status
    const updateQuery = `
      UPDATE requests
      SET status = $1, admin_comment = $2, reviewed_at = NOW(), reviewed_by = $3
      WHERE id = $4
      RETURNING matricule, nom, prenom, email, specialite_actuelle, specialite_souhaitee
    `;
    const updateResult = await client.query(updateQuery, [status, adminComment, adminName, id]);

    if (updateResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request not found' })
      };
    }

    const requestData = updateResult.rows[0];

    // Send notification email
    let emailSent = false;
    try {
      emailSent = await sendStatusUpdateNotification({
        ...requestData,
        status,
        adminComment,
      });
    } catch (emailError) {
      console.error('Email sending failed but continuing:', emailError);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Request ${status} successfully`,
        emailSent
      })
    };
  } catch (error) {
    console.error('Update request error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to update request',
        details: error.message 
      })
    };
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
};