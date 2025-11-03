import { NextRequest, NextResponse } from 'next/server';
import { verify2FACode } from '@/lib/twoFactor';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    console.log('🔐 2FA Verification Request:', { email, code: code?.length });

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code sont requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error('❌ User not found:', email);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.id, user.name);

    // Vérifier le code 2FA
    const verification = await verify2FACode(user.id, code);

    console.log('🔍 Verification result:', verification);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.message },
        { status: 401 }
      );
    }

    // Récupérer l'IP et le user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Créer la session JWT
    const token = await createSession(user.id, ipAddress, userAgent);

    // Préparer l'objet user sans le mot de passe
    const { password_hash, ...userWithoutPassword } = user;

    // Créer la réponse avec le cookie de session
    const response = NextResponse.json({
      message: 'Authentification 2FA réussie',
      user: userWithoutPassword,
    });

    // Définir le cookie HTTP-only avec le token
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du code 2FA' },
      { status: 500 }
    );
  }
}
