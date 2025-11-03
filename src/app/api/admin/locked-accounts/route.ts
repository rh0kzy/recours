import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getLockedAccountsStats, getAccountsWithFailedAttempts } from '@/lib/rateLimitDB';

/**
 * GET /api/admin/locked-accounts
 * Obtenir les statistiques des comptes verrouillés
 * Réservé aux super admins
 */
export async function GET(request: NextRequest) {
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

    // Récupérer les statistiques
    const [lockedStats, failedAttemptsStats] = await Promise.all([
      getLockedAccountsStats(),
      getAccountsWithFailedAttempts(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        locked: lockedStats,
        failedAttempts: failedAttemptsStats,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Locked accounts stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locked accounts statistics' },
      { status: 500 }
    );
  }
}
