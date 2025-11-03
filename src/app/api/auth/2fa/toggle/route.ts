import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { toggle2FA, is2FAEnabled } from '@/lib/twoFactor';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Vérifier si le 2FA est activé
    const enabled = await is2FAEnabled(user.id);

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return NextResponse.json(
      { error: 'Failed to check 2FA status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Toggle 2FA
    const result = await toggle2FA(user.id, enabled);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({
      message: result.message,
      enabled,
    });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to toggle 2FA' },
      { status: 500 }
    );
  }
}
