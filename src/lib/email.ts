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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; text-align: center; margin: 0; font-size: 24px;">
            Université des Sciences et de Technologie Houari Boumediene
          </h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Confirmation de votre demande</h2>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Cher(e) <strong>${formData.prenom} ${formData.nom}</strong>,
          </p>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Votre demande de changement de spécialité a été enregistrée avec succès. Voici un récapitulatif de votre demande :
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333; width: 40%;">Matricule :</td>
                <td style="padding: 8px 0; color: #666;">${formData.matricule}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Spécialité actuelle :</td>
                <td style="padding: 8px 0; color: #666;">${formData.specialiteActuelle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Spécialité souhaitée :</td>
                <td style="padding: 8px 0; color: #666;">${formData.specialiteSouhaitee}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Email :</td>
                <td style="padding: 8px 0; color: #666;">${formData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Téléphone :</td>
                <td style="padding: 8px 0; color: #666;">${formData.telephone}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
            <h3 style="color: #1976D2; margin: 0 0 10px 0;">Raison de la demande :</h3>
            <p style="color: #666; margin: 0; line-height: 1.6;">${formData.raison}</p>
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