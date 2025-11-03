import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { unlockAccount } from '@/lib/rateLimitDB';

/**
 * POST /api/admin/unlock-account
 * Débloquer un compte administrateur
 * Réservé aux super admins
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le token de session
    const token = request.cookies.get('admin_session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vérifier la session
    const session = await verifySession(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est super admin
    if (session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden. Super admin access required.' },
        { status: 403 }
      );
    }

    // Récupérer l'email à débloquer
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Débloquer le compte
    const result = await unlockAccount(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Unlock account error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock account' },
      { status: 500 }
    );
  }
}
