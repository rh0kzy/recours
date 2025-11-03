import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';
import { 
  checkIpRateLimit, 
  checkEmailRateLimit, 
  recordFailedAttempt,
  resetRateLimit,
  formatTimeRemaining 
} from '@/lib/rateLimit';

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

    // Vérifier le rate limiting par IP
    const ipCheck = checkIpRateLimit(ipAddress);
    if (!ipCheck.allowed) {
      const timeRemaining = formatTimeRemaining(
        (ipCheck.blockedUntil || Date.now()) - Date.now()
      );
      return NextResponse.json(
        { 
          error: `Trop de tentatives depuis cette adresse IP. Réessayez dans ${timeRemaining}.`,
          retryAfter: ipCheck.blockedUntil 
        },
        { status: 429 }
      );
    }

    // Vérifier le rate limiting par email
    const emailCheck = checkEmailRateLimit(email);
    if (!emailCheck.allowed) {
      const timeRemaining = formatTimeRemaining(
        (emailCheck.blockedUntil || Date.now()) - Date.now()
      );
      return NextResponse.json(
        { 
          error: `Trop de tentatives pour ce compte. Réessayez dans ${timeRemaining}.`,
          retryAfter: emailCheck.blockedUntil 
        },
        { status: 429 }
      );
    }

    // Authenticate user
    const result = await authenticateAdmin(email, password, ipAddress, userAgent);

    if ('error' in result) {
      // Enregistrer la tentative échouée
      recordFailedAttempt(ipAddress, email);
      
      return NextResponse.json(
        { 
          error: result.error,
          remainingAttempts: Math.min(
            ipCheck.remainingAttempts || 0,
            emailCheck.remainingAttempts || 0
          ) - 1
        },
        { status: 401 }
      );
    }

    // Réinitialiser le rate limiting en cas de succès
    resetRateLimit(ipAddress, email);

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
