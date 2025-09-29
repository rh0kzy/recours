const { Client } = require('pg');
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

const sendAdminNotification = async (requestData) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email configuration missing, skipping admin notification');
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
    console.error('Admin email sending failed:', error);
    return false;
  }
};

const sendStudentConfirmation = async (requestData) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email configuration missing, skipping student confirmation');
      return false;
    }

    const transporter = createTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; text-align: center; margin: 0; font-size: 24px;">
            Université des Sciences et de Technologie Houari Boumediene
          </h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Confirmation de votre demande</h2>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Cher(e) <strong>${requestData.prenom} ${requestData.nom}</strong>,
          </p>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Votre demande de changement de spécialité a été enregistrée avec succès. Voici un récapitulatif de votre demande :
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333; width: 40%;">Matricule :</td>
                <td style="padding: 8px 0; color: #666;">${requestData.matricule}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Spécialité actuelle :</td>
                <td style="padding: 8px 0; color: #666;">${requestData.specialiteActuelle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Spécialité souhaitée :</td>
                <td style="padding: 8px 0; color: #666;">${requestData.specialiteSouhaitee}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Email :</td>
                <td style="padding: 8px 0; color: #666;">${requestData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Téléphone :</td>
                <td style="padding: 8px 0; color: #666;">${requestData.telephone}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
            <h3 style="color: #1976D2; margin: 0 0 10px 0;">Raison de la demande :</h3>
            <p style="color: #666; margin: 0; line-height: 1.6;">${requestData.raison}</p>
          </div>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Votre demande sera examinée par l'administration. Vous recevrez une réponse dans les plus brefs délais.
          </p>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Pour toute question, veuillez contacter l'administration de l'USTHB.
          </p>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Cet email a été envoyé automatiquement par le système de gestion des demandes de l'USTHB.
            </p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: requestData.email, // Send to student
      subject: 'Confirmation de demande de changement de spécialité - USTHB',
      html
    });

    return true;
  } catch (error) {
    console.error('Student confirmation email sending failed:', error);
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

    // Send email notifications
    let adminEmailSent = false;
    let studentEmailSent = false;
    
    try {
      // Send admin notification
      adminEmailSent = await sendAdminNotification({
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
      console.error('Admin email sending failed but continuing:', emailError);
    }

    try {
      // Send student confirmation
      studentEmailSent = await sendStudentConfirmation({
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
      console.error('Student email sending failed but continuing:', emailError);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Request submitted successfully',
        adminEmailSent,
        studentEmailSent
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