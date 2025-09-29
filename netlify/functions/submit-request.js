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

const sendSpecialtyChangeNotification = async (requestData) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email configuration missing, skipping email notification');
      return false;
    }

    const transporter = createTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nouvelle demande de changement de spécialité</h2>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Informations de l'étudiant:</h3>
          <p><strong>Matricule:</strong> ${requestData.matricule}</p>
          <p><strong>Nom complet:</strong> ${requestData.prenom} ${requestData.nom}</p>
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Téléphone:</strong> ${requestData.telephone}</p>
          <p><strong>Spécialité actuelle:</strong> ${requestData.specialiteActuelle}</p>
          <p><strong>Spécialité souhaitée:</strong> ${requestData.specialiteSouhaitee}</p>
          <p><strong>Raison:</strong> ${requestData.raison}</p>
        </div>

        <p>Cette demande nécessite une révision de l'administration.</p>

        <p>Cordialement,<br>Système de gestion des demandes USTHB</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to admin
      subject: 'Nouvelle demande de changement de spécialité',
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
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
    const { matricule, nom, prenom, email, telephone, specialiteActuelle, specialiteSouhaitee, raison } = requestBody;

    // Validate required fields
    if (!matricule || !nom || !prenom || !email || !specialiteActuelle || !specialiteSouhaitee) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    const query = `
      INSERT INTO requests (matricule, nom, prenom, email, telephone, specialite_actuelle, specialite_souhaitee, raison)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [matricule, nom, prenom, email, telephone, specialiteActuelle, specialiteSouhaitee, raison];
    await client.query(query, values);

    // Send email notification
    let emailSent = false;
    try {
      emailSent = await sendSpecialtyChangeNotification({
        matricule,
        nom,
        prenom,
        email,
        telephone,
        specialiteActuelle,
        specialiteSouhaitee,
        raison,
      });
    } catch (emailError) {
      console.error('Email sending failed but continuing:', emailError);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Request submitted successfully',
        emailSent
      })
    };
  } catch (error) {
    console.error('Submit request error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to submit request',
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