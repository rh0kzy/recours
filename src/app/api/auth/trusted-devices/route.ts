import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getUserTrustedDevices, revokeTrustedDevice, revokeAllTrustedDevices } from '@/lib/trustedDevices';

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

    const devices = await getUserTrustedDevices(user.id);

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Error fetching trusted devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trusted devices' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { deviceId, revokeAll } = await request.json();

    if (revokeAll) {
      // Révoquer tous les appareils
      const result = await revokeAllTrustedDevices(user.id);
      
      // Supprimer le cookie device_trust
      const response = NextResponse.json(result);
      response.cookies.delete('device_trust');
      
      return response;
    }

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Révoquer un appareil spécifique
    const result = await revokeTrustedDevice(deviceId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error revoking trusted device:', error);
    return NextResponse.json(
      { error: 'Failed to revoke trusted device' },
      { status: 500 }
    );
  }
}
