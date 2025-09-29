import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendSpecialtyChangeNotification = async (formData: {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialiteActuelle: string;
  specialiteSouhaitee: string;
  raison: string;
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: formData.email, // Send to the student's email
    subject: 'Confirmation de demande de changement de spécialité - USTHB',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Confirmation de demande - USTHB</title>
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
            .reason-section {
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
            
            <h2 style="color: #333; margin-bottom: 20px; font-size: 22px;">Confirmation de votre demande</h2>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Cher(e) <strong>${formData.prenom} ${formData.nom}</strong>,
            </p>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Votre demande de changement de spécialité a été enregistrée avec succès. Voici un récapitulatif de votre demande :
            </p>

            <!-- Information Table -->
            <div class="info-table" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; width: 40%; vertical-align: top;">Matricule :</td>
                  <td class="value" style="padding: 8px 0; color: #666; word-break: break-word;">${formData.matricule}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Spécialité actuelle :</td>
                  <td class="value" style="padding: 8px 0; color: #666; word-break: break-word;">${formData.specialiteActuelle}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Spécialité souhaitée :</td>
                  <td class="value" style="padding: 8px 0; color: #666; word-break: break-word;">${formData.specialiteSouhaitee}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Email :</td>
                  <td class="value" style="padding: 8px 0; color: #666; word-break: break-all;">${formData.email}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Téléphone :</td>
                  <td class="value" style="padding: 8px 0; color: #666; word-break: break-word;">${formData.telephone}</td>
                </tr>
              </table>
            </div>

            <!-- Reason Section -->
            <div class="reason-section" style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3 style="color: #1976D2; margin: 0 0 10px 0; font-size: 18px;">Raison de la demande :</h3>
              <p style="color: #666; margin: 0; line-height: 1.6; font-size: 15px; word-wrap: break-word;">${formData.raison}</p>
            </div>

            <!-- Status Message -->
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <p style="color: #2e7d32; margin: 0; line-height: 1.6; font-size: 16px; font-weight: 500;">
                ✅ Votre demande sera examinée par l'administration. Vous recevrez une réponse dans les plus brefs délais.
              </p>
            </div>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Pour toute question, veuillez contacter l'administration de l'USTHB.
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', formData.email);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};