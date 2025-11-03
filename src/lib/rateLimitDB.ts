/**
 * Rate Limiting basé sur la base de données
 * Utilise les colonnes failed_login_attempts et locked_until de admin_users
 */

import { supabase } from './supabase';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: Date;
  message?: string;
}

/**
 * Vérifier si un compte est verrouillé
 */
export async function checkAccountLock(email: string): Promise<RateLimitResult> {
  try {
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('failed_login_attempts, locked_until')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      // Si l'utilisateur n'existe pas, on permet quand même (sera géré par l'auth)
      return {
        allowed: true,
        remainingAttempts: MAX_ATTEMPTS,
      };
    }

    // Vérifier si le compte est verrouillé
    if (user.locked_until) {
      const lockedUntil = new Date(user.locked_until);
      const now = new Date();

      if (lockedUntil > now) {
        // Compte toujours verrouillé
        const minutesRemaining = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000);
        return {
          allowed: false,
          remainingAttempts: 0,
          lockedUntil,
          message: `Compte verrouillé. Réessayez dans ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}.`,
        };
      } else {
        // Le verrouillage a expiré, réinitialiser
        await resetFailedAttempts(email);
        return {
          allowed: true,
          remainingAttempts: MAX_ATTEMPTS,
        };
      }
    }

    // Compte non verrouillé
    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - (user.failed_login_attempts || 0));
    
    return {
      allowed: remainingAttempts > 0,
      remainingAttempts,
      message: remainingAttempts === 0 ? 'Nombre maximum de tentatives atteint.' : undefined,
    };

  } catch (error) {
    console.error('Error checking account lock:', error);
    // En cas d'erreur, on permet la tentative (fail open)
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
    };
  }
}

/**
 * Enregistrer une tentative de connexion échouée
 */
export async function recordFailedLoginAttempt(email: string): Promise<void> {
  try {
    const { data: user, error: selectError } = await supabase
      .from('admin_users')
      .select('failed_login_attempts')
      .eq('email', email.toLowerCase())
      .single();

    if (selectError || !user) {
      console.error('User not found for failed attempt recording');
      return;
    }

    const newAttempts = (user.failed_login_attempts || 0) + 1;
    const shouldLock = newAttempts >= MAX_ATTEMPTS;

    const updateData: {
      failed_login_attempts: number;
      locked_until?: string;
    } = {
      failed_login_attempts: newAttempts,
    };

    if (shouldLock) {
      const lockUntil = new Date(Date.now() + LOCK_DURATION);
      updateData.locked_until = lockUntil.toISOString();
    }

    const { error: updateError } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('Error recording failed attempt:', updateError);
    }

  } catch (error) {
    console.error('Error recording failed login attempt:', error);
  }
}

/**
 * Réinitialiser les tentatives échouées après connexion réussie
 */
export async function resetFailedAttempts(email: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Error resetting failed attempts:', error);
    }
  } catch (error) {
    console.error('Error resetting failed attempts:', error);
  }
}

/**
 * Débloquer manuellement un compte (pour les super admins)
 */
export async function unlockAccount(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('email', email.toLowerCase());

    if (error) {
      return {
        success: false,
        message: `Erreur lors du déblocage : ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Compte débloqué avec succès',
    };
  } catch (error) {
    console.error('Error unlocking account:', error);
    return {
      success: false,
      message: 'Erreur lors du déblocage du compte',
    };
  }
}

/**
 * Obtenir les statistiques des comptes verrouillés (pour les admins)
 */
export async function getLockedAccountsStats() {
  try {
    const { data: lockedAccounts, error } = await supabase
      .from('admin_users')
      .select('email, name, failed_login_attempts, locked_until')
      .not('locked_until', 'is', null)
      .gte('locked_until', new Date().toISOString())
      .order('locked_until', { ascending: false });

    if (error) {
      console.error('Error fetching locked accounts:', error);
      return {
        lockedAccounts: [],
        totalLocked: 0,
      };
    }

    return {
      lockedAccounts: lockedAccounts || [],
      totalLocked: lockedAccounts?.length || 0,
    };
  } catch (error) {
    console.error('Error getting locked accounts stats:', error);
    return {
      lockedAccounts: [],
      totalLocked: 0,
    };
  }
}

/**
 * Obtenir les comptes avec tentatives échouées récentes
 */
export async function getAccountsWithFailedAttempts() {
  try {
    const { data: accounts, error } = await supabase
      .from('admin_users')
      .select('email, name, failed_login_attempts, locked_until')
      .gt('failed_login_attempts', 0)
      .order('failed_login_attempts', { ascending: false });

    if (error) {
      console.error('Error fetching accounts with failed attempts:', error);
      return {
        accounts: [],
        total: 0,
      };
    }

    return {
      accounts: accounts || [],
      total: accounts?.length || 0,
    };
  } catch (error) {
    console.error('Error getting accounts with failed attempts:', error);
    return {
      accounts: [],
      total: 0,
    };
  }
}

/**
 * Formater le temps restant en texte lisible
 */
export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  
  if (totalSeconds < 60) {
    return `${totalSeconds} seconde${totalSeconds > 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(totalSeconds / 60);
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}
