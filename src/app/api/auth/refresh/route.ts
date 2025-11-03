import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { Client } from 'pg';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * POST /api/auth/refresh
 * Rafraîchir le token de session si toujours valide
 */
export async function POST(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Récupérer le token actuel
    const currentToken = request.cookies.get('admin_session')?.value;

    if (!currentToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Vérifier que la session est valide
    const user = await verifySession(currentToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    await client.connect();

    // Générer un nouveau token
    const newToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30m')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Mettre à jour la session dans la DB
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION);
    
    // Supprimer l'ancienne session
    await client.query(
      'DELETE FROM admin_sessions WHERE token = $1',
      [currentToken]
    );

    // Créer la nouvelle session
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await client.query(
      `INSERT INTO admin_sessions (admin_user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, newToken, newExpiresAt, ipAddress, userAgent]
    );

    // Nettoyer les sessions expirées
    await client.query('DELETE FROM admin_sessions WHERE expires_at < NOW()');

    // Créer la réponse avec le nouveau cookie
    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed',
      expiresAt: newExpiresAt.toISOString(),
    });

    // Mettre à jour le cookie avec le nouveau token
    response.cookies.set('admin_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
