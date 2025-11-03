import { supabase } from './supabase';
import crypto from 'crypto';

/**
 * Génère un code 2FA à 6 chiffres
 */
export function generate2FACode(): string {
  // Génère un nombre aléatoire entre 100000 et 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Crée et stocke un nouveau code 2FA pour un utilisateur
 */
export async function create2FACode(
  adminUserId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ code: string; expiresAt: Date }> {
  // Génère le code
  const code = generate2FACode();
  
  // Le code expire dans 10 minutes
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  // Invalider tous les codes précédents non vérifiés pour cet utilisateur
  await supabase
    .from('two_factor_codes')
    .delete()
    .eq('admin_user_id', adminUserId)
    .eq('verified', false);

  // Insérer le nouveau code
  const { error } = await supabase
    .from('two_factor_codes')
    .insert({
      admin_user_id: adminUserId,
      code,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    });

  if (error) {
    console.error('Error creating 2FA code:', error);
    throw new Error('Failed to create 2FA code');
  }

  return { code, expiresAt };
}

/**
 * Vérifie un code 2FA
 */
export async function verify2FACode(
  adminUserId: string,
  code: string
): Promise<{ valid: boolean; message: string }> {
  // Nettoyer le code (enlever espaces, s'assurer que c'est bien 6 chiffres)
  const cleanCode = code.trim();
  
  console.log('🔍 Verifying 2FA code:', {
    adminUserId,
    codeLength: cleanCode.length,
    codeValue: cleanCode
  });

  // Récupérer tous les codes non vérifiés de l'utilisateur pour debug
  const { data: allCodes, error: debugError } = await supabase
    .from('two_factor_codes')
    .select('*')
    .eq('admin_user_id', adminUserId)
    .eq('verified', false)
    .order('created_at', { ascending: false });

  console.log('📋 All unverified codes for user:', allCodes);

  if (debugError) {
    console.error('❌ Error fetching codes:', debugError);
  }

  // Comparer manuellement les codes pour déboguer
  if (allCodes && allCodes.length > 0) {
    console.log('🔎 Manual code comparison:');
    allCodes.forEach(c => {
      console.log({
        stored: c.code,
        storedType: typeof c.code,
        input: cleanCode,
        inputType: typeof cleanCode,
        match: c.code === cleanCode,
        matchLoose: c.code == cleanCode,
        matchString: String(c.code) === String(cleanCode)
      });
    });
  }

  // SOLUTION ALTERNATIVE : Faire la comparaison en JavaScript au lieu de SQL
  // pour éviter les problèmes de type entre PostgreSQL et JS
  if (!allCodes || allCodes.length === 0) {
    console.log('❌ No codes found for user');
    return { valid: false, message: 'Code incorrect ou déjà utilisé' };
  }

  // Trouver le code qui correspond (comparaison flexible)
  const matchingCode = allCodes.find(c => 
    String(c.code).trim() === String(cleanCode).trim()
  );

  if (!matchingCode) {
    console.log('❌ No matching code found in manual comparison');
    return { valid: false, message: 'Code incorrect ou déjà utilisé' };
  }

  console.log('✅ Code matched manually!');
  const codeData = matchingCode;
  console.log('📄 Code data:', {
    code: codeData.code,
    expiresAt: codeData.expires_at,
    verified: codeData.verified,
    createdAt: codeData.created_at
  });

  // Vérifier si le code a expiré
  const now = new Date();
  const expiresAt = new Date(codeData.expires_at);

  console.log('⏰ Time comparison:', {
    now: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    nowTimestamp: now.getTime(),
    expiresAtTimestamp: expiresAt.getTime(),
    isExpired: now > expiresAt,
    minutesRemaining: (expiresAt.getTime() - now.getTime()) / 60000
  });

  if (now > expiresAt) {
    console.log('❌ Code expired');
    return { valid: false, message: 'Le code a expiré. Demandez un nouveau code.' };
  }

  console.log('✅ Code is still valid');

  // Marquer le code comme vérifié
  await supabase
    .from('two_factor_codes')
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
    })
    .eq('id', codeData.id);

  return { valid: true, message: 'Code vérifié avec succès' };
}

/**
 * Vérifie si un utilisateur a le 2FA activé
 */
export async function is2FAEnabled(adminUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('two_factor_enabled, role')
    .eq('id', adminUserId)
    .single();

  if (error || !data) {
    return false;
  }

  // Le 2FA est automatiquement activé pour les Super Admins
  return data.two_factor_enabled || data.role === 'super_admin';
}

/**
 * Active ou désactive le 2FA pour un utilisateur
 */
export async function toggle2FA(
  adminUserId: string,
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('admin_users')
    .update({ two_factor_enabled: enabled })
    .eq('id', adminUserId);

  if (error) {
    console.error('Error toggling 2FA:', error);
    return { 
      success: false, 
      message: 'Erreur lors de la modification du 2FA' 
    };
  }

  return { 
    success: true, 
    message: enabled ? '2FA activé avec succès' : '2FA désactivé avec succès' 
  };
}

/**
 * Nettoie les codes 2FA expirés (fonction de maintenance)
 */
export async function cleanupExpired2FACodes(): Promise<void> {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  await supabase
    .from('two_factor_codes')
    .delete()
    .lt('expires_at', oneHourAgo.toISOString());
}
