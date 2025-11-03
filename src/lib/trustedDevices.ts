import { supabase } from './supabase';
import crypto from 'crypto';

/**
 * Génère un token unique pour identifier un appareil de confiance
 */
export function generateDeviceToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Génère un nom descriptif pour l'appareil basé sur le User Agent
 */
export function generateDeviceName(userAgent: string): string {
  // Extraire le navigateur et l'OS du User Agent
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Détection du navigateur
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // Détection de l'OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return `${browser} sur ${os}`;
}

/**
 * Crée un appareil de confiance
 */
export async function createTrustedDevice(
  adminUserId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateDeviceToken();
  const deviceName = generateDeviceName(userAgent);
  
  // L'appareil est de confiance pendant 30 jours
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error } = await supabase
    .from('trusted_devices')
    .insert({
      admin_user_id: adminUserId,
      device_token: token,
      device_name: deviceName,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error('Error creating trusted device:', error);
    throw new Error('Failed to create trusted device');
  }

  console.log('✅ Trusted device created:', {
    userId: adminUserId,
    deviceName,
    expiresAt: expiresAt.toISOString()
  });

  return { token, expiresAt };
}

/**
 * Vérifie si un appareil est de confiance et valide
 */
export async function verifyTrustedDevice(
  adminUserId: string,
  deviceToken: string
): Promise<{ trusted: boolean; deviceName?: string }> {
  if (!deviceToken) {
    return { trusted: false };
  }

  const { data, error } = await supabase
    .from('trusted_devices')
    .select('*')
    .eq('admin_user_id', adminUserId)
    .eq('device_token', deviceToken)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    console.log('❌ Device not trusted:', { adminUserId, error: error?.message });
    return { trusted: false };
  }

  // Mettre à jour last_used
  await supabase
    .from('trusted_devices')
    .update({ last_used: new Date().toISOString() })
    .eq('id', data.id);

  console.log('✅ Device verified as trusted:', {
    userId: adminUserId,
    deviceName: data.device_name
  });

  return { trusted: true, deviceName: data.device_name };
}

/**
 * Récupère tous les appareils de confiance d'un utilisateur
 */
export async function getUserTrustedDevices(adminUserId: string) {
  const { data, error } = await supabase
    .from('trusted_devices')
    .select('*')
    .eq('admin_user_id', adminUserId)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .order('last_used', { ascending: false });

  if (error) {
    console.error('Error fetching trusted devices:', error);
    return [];
  }

  return data || [];
}

/**
 * Révoque un appareil de confiance
 */
export async function revokeTrustedDevice(
  deviceId: string
): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('trusted_devices')
    .update({
      revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq('id', deviceId);

  if (error) {
    console.error('Error revoking trusted device:', error);
    return { success: false, message: 'Erreur lors de la révocation' };
  }

  return { success: true, message: 'Appareil révoqué avec succès' };
}

/**
 * Révoque tous les appareils de confiance d'un utilisateur
 */
export async function revokeAllTrustedDevices(
  adminUserId: string
): Promise<{ success: boolean; message: string; count: number }> {
  const { data, error } = await supabase
    .from('trusted_devices')
    .update({
      revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq('admin_user_id', adminUserId)
    .eq('revoked', false)
    .select();

  if (error) {
    console.error('Error revoking all trusted devices:', error);
    return { success: false, message: 'Erreur lors de la révocation', count: 0 };
  }

  return {
    success: true,
    message: `${data?.length || 0} appareil(s) révoqué(s)`,
    count: data?.length || 0,
  };
}

/**
 * Nettoie les appareils expirés ou révoqués
 */
export async function cleanupExpiredTrustedDevices(): Promise<void> {
  await supabase
    .from('trusted_devices')
    .delete()
    .or(`expires_at.lt.${new Date().toISOString()},revoked.eq.true`);
}
