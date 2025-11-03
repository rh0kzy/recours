import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken, resetPasswordWithToken } from '@/lib/passwordReset';

/**
 * GET /api/auth/reset-password?token=xxx
 * Vérifier qu'un token de réinitialisation est valide
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    const verification = await verifyResetToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        { 
          valid: false, 
          message: verification.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: verification.email,
      name: verification.name,
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du token' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/reset-password
 * Réinitialiser le mot de passe avec un token valide
 */
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Réinitialiser le mot de passe
    const result = await resetPasswordWithToken(token, password, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réinitialisation' },
      { status: 500 }
    );
  }
}
