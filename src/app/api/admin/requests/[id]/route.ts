import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import nodemailer from 'nodemailer';

export async function PATCH(request: NextRequest) {
  const { id, status, adminComment, adminName } = await request.json();

  if (!id || !status || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
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
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const requestData = updateResult.rows[0];

    // Send notification email to student
    const emailSent = await sendStatusUpdateNotification({
      ...requestData,
      status,
      adminComment,
    });

    return NextResponse.json({
      message: `Request ${status} successfully`,
      emailSent
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // Delete the request
    const deleteQuery = `DELETE FROM requests WHERE id = $1 RETURNING id`;
    const deleteResult = await client.query(deleteQuery, [id]);

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Request deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  } finally {
    await client.end();
  }
}

async function sendStatusUpdateNotification(data: {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  specialite_actuelle: string;
  specialite_souhaitee: string;
  status: string;
  adminComment?: string;
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const statusText = data.status === 'approved' ? 'Approuvée' : 'Refusée';
  const statusColor = data.status === 'approved' ? '#4CAF50' : '#f44336';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: `Décision concernant votre demande de changement de spécialité - USTHB`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; text-align: center; margin: 0; font-size: 24px;">
            Université des Sciences et de Technologie Houari Boumediene
          </h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Décision Administrative</h2>

          <div style="background: ${statusColor}; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0; font-size: 18px;">Votre demande a été ${statusText.toLowerCase()}</h3>
          </div>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Cher(e) <strong>${data.prenom} ${data.nom}</strong>,
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Matricule :</td>
                <td style="padding: 8px 0; color: #666;">${data.matricule}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Spécialité actuelle :</td>
                <td style="padding: 8px 0; color: #666;">${data.specialite_actuelle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Spécialité souhaitée :</td>
                <td style="padding: 8px 0; color: #666;">${data.specialite_souhaitee}</td>
              </tr>
            </table>
          </div>

          ${data.adminComment ? `
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3 style="color: #1976D2; margin: 0 0 10px 0;">Commentaire de l'administration :</h3>
              <p style="color: #666; margin: 0; line-height: 1.6;">${data.adminComment}</p>
            </div>
          ` : ''}

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            ${data.status === 'approved'
              ? 'Votre changement de spécialité a été approuvé. Veuillez vous présenter au service concerné pour finaliser les démarches administratives.'
              : 'Votre demande de changement de spécialité a été refusée. Pour plus d\'informations, veuillez contacter l\'administration.'}
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
    console.log(`Status update email sent to: ${data.email} (${data.status})`);
    return true;
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return false;
  }
}