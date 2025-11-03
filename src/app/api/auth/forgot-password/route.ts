import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/passwordReset';
import { sendPasswordResetEmail } from '@/lib/email';
import { Client } from 'pg';

/**
 * POST /api/auth/forgot-password
 * Demander un lien de réinitialisation de mot de passe
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Créer le token de réinitialisation
    const result = await createPasswordResetToken(email, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Si le token a été créé, envoyer l'email
    if (result.token) {
      // Récupérer le nom de l'utilisateur
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      try {
        await client.connect();
        const userResult = await client.query(
          'SELECT name FROM admin_users WHERE email = $1',
          [email.toLowerCase()]
        );

        if (userResult.rows.length > 0) {
          const userName = userResult.rows[0].name;
          
          // Envoyer l'email de réinitialisation
          await sendPasswordResetEmail(email, userName, result.token);
        }
      } catch (emailError) {
        console.error('Error sending reset email:', emailError);
        // Ne pas révéler l'erreur pour des raisons de sécurité
      } finally {
        await client.end();
      }
    }

    // Toujours retourner un succès pour ne pas révéler si l'email existe
    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
