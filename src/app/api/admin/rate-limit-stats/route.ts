import { NextRequest, NextResponse } from 'next/server';
import { getRateLimitStats } from '@/lib/rateLimit';
import { verifySession } from '@/lib/auth';

/**
 * GET /api/admin/rate-limit-stats
 * Récupère les statistiques de rate limiting
 * Accessible uniquement par les super admins
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
    const stats = getRateLimitStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Rate limit stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit statistics' },
      { status: 500 }
    );
  }
}
