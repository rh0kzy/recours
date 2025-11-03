import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';
import { 
  checkAccountLock, 
  recordFailedLoginAttempt,
  resetFailedAttempts,
  formatTimeRemaining 
} from '@/lib/rateLimitDB';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Vérifier si le compte est verrouillé (basé sur la DB)
    const accountCheck = await checkAccountLock(email);
    if (!accountCheck.allowed) {
      const timeRemaining = accountCheck.lockedUntil 
        ? formatTimeRemaining(accountCheck.lockedUntil.getTime() - Date.now())
        : '15 minutes';
      
      return NextResponse.json(
        { 
          error: accountCheck.message || `Compte verrouillé. Réessayez dans ${timeRemaining}.`,
          remainingAttempts: 0,
          lockedUntil: accountCheck.lockedUntil
        },
        { status: 429 }
      );
    }

    // Authenticate user
    const result = await authenticateAdmin(email, password, ipAddress, userAgent);

    if ('error' in result) {
      // Enregistrer la tentative échouée dans la DB
      await recordFailedLoginAttempt(email);
      
      // Recalculer les tentatives restantes après l'enregistrement
      const updatedCheck = await checkAccountLock(email);
      
      return NextResponse.json(
        { 
          error: result.error,
          remainingAttempts: updatedCheck.remainingAttempts
        },
        { status: 401 }
      );
    }

    // Réinitialiser les tentatives échouées en cas de succès
    await resetFailedAttempts(email);

    // Create response with session cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: result.user,
    });

    // Set HTTP-only cookie with token
    response.cookies.set('admin_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
