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

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Réinitialisation de mot de passe - USTHB Admin',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
        <style>
          @media screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .header { padding: 20px 15px !important; }
            .content { padding: 20px 15px !important; }
            h1 { font-size: 20px !important; }
            h2 { font-size: 18px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          
          <!-- Header -->
          <div class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Réinitialisation de mot de passe</h1>
          </div>

          <!-- Main Content -->
          <div class="content" style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <h2 style="color: #333; margin-bottom: 20px; font-size: 22px;">Bonjour ${name},</h2>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte administrateur USTHB.
            </p>

            <p style="color: #666; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
              Si vous êtes à l&apos;origine de cette demande, cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
            </p>

            <!-- Reset Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Réinitialiser mon mot de passe
              </a>
            </div>

            <!-- Alternative Link -->
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="color: #667eea; font-size: 13px; word-break: break-all; background: #f5f7ff; padding: 10px; border-radius: 5px; margin: 10px 0;">
              ${resetUrl}
            </p>

            <!-- Warning Box -->
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 5px;">
              <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Important :</strong><br>
                Ce lien est valable pendant <strong>1 heure</strong> et ne peut être utilisé qu&apos;une seule fois.
              </p>
            </div>

            <!-- Security Notice -->
            <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #721c24; font-size: 14px; line-height: 1.6;">
                <strong>🛡️ Sécurité :</strong><br>
                Si vous n&apos;avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
              </p>
            </div>

            <!-- Footer Info -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">
                Cordialement,<br>
                <strong style="color: #666;">L&apos;équipe USTHB</strong>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Ceci est un email automatique, merci de ne pas y répondre.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              © 2025 USTHB - Tous droits réservés
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${name},

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte administrateur USTHB.

Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant :
${resetUrl}

Ce lien est valable pendant 1 heure et ne peut être utilisé qu'une seule fois.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.

Cordialement,
L'équipe USTHB
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
