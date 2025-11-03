import { NextRequest, NextResponse } from 'next/server';
import { create2FACode, is2FAEnabled } from '@/lib/twoFactor';
import { send2FACode } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email est requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, name, two_factor_enabled, role')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le 2FA est activé pour cet utilisateur
    const twoFactorEnabled = await is2FAEnabled(user.id);
    
    if (!twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Le 2FA n\'est pas activé pour cet utilisateur' },
        { status: 400 }
      );
    }

    // Récupérer l'IP et le user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Créer le code 2FA
    const { code, expiresAt } = await create2FACode(user.id, ipAddress, userAgent);

    console.log('📧 2FA Code generated:', {
      userId: user.id,
      email: user.email,
      code: code,
      expiresAt: expiresAt.toISOString()
    });

    // Envoyer l'email avec le code
    await send2FACode(user.email, user.name, code, 10);

    return NextResponse.json({
      message: 'Code 2FA envoyé avec succès',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error sending 2FA code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code 2FA' },
      { status: 500 }
    );
  }
}
