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

const sendStatusUpdateNotification = async (requestData) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email configuration missing, skipping email notification');
      return false;
    }

    const transporter = createTransporter();

    const subject = requestData.status === 'approved'
      ? 'Votre demande de changement de spécialité a été approuvée - USTHB'
      : 'Votre demande de changement de spécialité a été rejetée - USTHB';

    const statusText = requestData.status === 'approved' ? 'APPROUVÉE' : 'REJETÉE';
    const statusColor = requestData.status === 'approved' ? '#4CAF50' : '#f44336';
    const statusBgColor = requestData.status === 'approved' ? '#e8f5e8' : '#ffebee';

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Décision de votre demande - USTHB</title>
        <style>
          @media screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              padding: 10px !important;
            }
            .header {
              padding: 20px 15px !important;
            }
            .header h1 {
              font-size: 18px !important;
              line-height: 1.3 !important;
            }
            .content {
              padding: 20px 15px !important;
            }
            .info-table {
              padding: 15px !important;
            }
            .info-table td {
              display: block !important;
              width: 100% !important;
              padding: 4px 0 !important;
            }
            .info-table .label {
              font-weight: bold !important;
              margin-bottom: 2px !important;
            }
            .info-table .value {
              margin-bottom: 15px !important;
              padding-left: 0 !important;
            }
            .status-banner {
              padding: 12px !important;
            }
            h2 {
              font-size: 20px !important;
            }
            h3 {
              font-size: 16px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          
          <!-- Header -->
          <div class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: white; text-align: center; margin: 0; font-size: 24px; line-height: 1.4;">
              Université des Sciences et de Technologie<br>
              Houari Boumediene
            </h1>
          </div>

          <!-- Main Content -->
          <div class="content" style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <h2 style="color: #333; margin-bottom: 20px; font-size: 22px;">Décision Administrative</h2>

            <!-- Status Banner -->
            <div class="status-banner" style="background: ${statusBgColor}; color: ${statusColor}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid ${statusColor};">
              <h3 style="margin: 0; font-size: 18px; font-weight: bold;">
                ${requestData.status === 'approved' ? '✅' : '❌'} Votre demande a été ${statusText}
              </h3>
            </div>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Cher(e) <strong>${requestData.prenom} ${requestData.nom}</strong>,
            </p>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Nous vous informons que votre demande de changement de spécialité a été examinée par l'administration.
            </p>

            <!-- Information Table -->
            <div class="info-table" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 15px 0; color: #333;">Détails de votre demande :</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; width: 40%; vertical-align: top;">Matricule :</td>
                  <td class="value" style="padding: 8px 0; color: #666; word-break: break-word;">${requestData.matricule}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Spécialité actuelle :</td>
                  <td class="value" style="padding: 8px 0; color: #666; word-break: break-word;">${requestData.specialite_actuelle}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Spécialité souhaitée :</td>
                  <td class="value" style="padding: 8px 0; color: #666; word-break: break-word;">${requestData.specialite_souhaitee}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Statut :</td>
                  <td class="value" style="padding: 8px 0; color: ${statusColor}; font-weight: bold;">${statusText}</td>
                </tr>
              </table>
            </div>

            ${requestData.adminComment ? `
              <!-- Admin Comment -->
              <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
                <h3 style="color: #1976D2; margin: 0 0 10px 0; font-size: 18px;">Commentaire de l'administration :</h3>
                <p style="color: #666; margin: 0; line-height: 1.6; font-size: 15px; word-wrap: break-word;">${requestData.adminComment}</p>
              </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background: ${statusBgColor}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
              <h4 style="color: ${statusColor}; margin: 0 0 10px 0; font-size: 16px;">Prochaines étapes :</h4>
              <p style="color: #666; margin: 0; line-height: 1.6; font-size: 15px;">
                ${requestData.status === 'approved'
                  ? 'Félicitations ! Votre changement de spécialité a été approuvé. Veuillez vous présenter au service concerné pour finaliser les démarches administratives dans les plus brefs délais.'
                  : 'Votre demande de changement de spécialité a été rejetée. Pour plus d\'informations sur les raisons du refus ou pour soumettre une nouvelle demande, veuillez contacter l\'administration.'}
              </p>
            </div>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Pour toute question concernant cette décision, veuillez contacter l'administration de l'USTHB.
            </p>

            <!-- Contact Information -->
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Contact :</h4>
              <p style="color: #666; margin: 0; line-height: 1.6; font-size: 14px;">
                📧 Email : administration@usthb.dz<br>
                📞 Téléphone : +213 (0) 21 24 79 50<br>
                🌐 Site web : www.usthb.dz
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.4;">
                Cet email a été envoyé automatiquement par le système de gestion des demandes de l'USTHB.<br>
                Merci de ne pas répondre à cet email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"USTHB - Administration" <${process.env.EMAIL_USER}>`,
      to: requestData.email,
      subject,
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

exports.handler = async (event, context) => {
  // Add debugging
  console.log('Request method:', event.httpMethod);
  console.log('Request path:', event.path);
  console.log('Event body:', event.body);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!['PATCH', 'DELETE'].includes(event.httpMethod)) {
    console.log('Method not allowed:', event.httpMethod);
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
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Handle DELETE request
    if (event.httpMethod === 'DELETE') {
      // Extract id from path parameters
      console.log('DELETE request path:', event.path);
      const pathParts = event.path.split('/');
      console.log('Path parts:', pathParts);
      const id = parseInt(pathParts[pathParts.length - 1], 10);
      console.log('Parsed ID:', id);

      if (!id || isNaN(id)) {
        console.log('Invalid ID:', id);
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid request ID' })
        };
      }

      // Delete the request
      const deleteQuery = `DELETE FROM requests WHERE id = $1 RETURNING id`;
      const deleteResult = await client.query(deleteQuery, [id]);

      if (deleteResult.rows.length === 0) {
        return {
          statusCode: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Request not found' })
        };
      }

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Request deleted successfully',
          deletedId: id
        })
      };
    }

    // Handle PATCH request
    const requestBody = JSON.parse(event.body);
    const { id, status, adminComment, adminName } = requestBody;

    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request data' })
      };
    }

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
    console.error('Request operation error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to process request',
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