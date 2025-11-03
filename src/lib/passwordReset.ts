/**
 * Fonctions pour la réinitialisation de mot de passe
 */

import { Client } from 'pg';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const TOKEN_EXPIRATION = 1 * 60 * 60 * 1000; // 1 heure

interface PasswordResetResult {
  success: boolean;
  message: string;
  token?: string;
}

/**
 * Générer un token de réinitialisation sécurisé
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Créer un token de réinitialisation pour un utilisateur
 */
export async function createPasswordResetToken(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<PasswordResetResult> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Vérifier que l'utilisateur existe
    const userQuery = 'SELECT id, email, name, is_active FROM admin_users WHERE email = $1';
    const userResult = await client.query(userQuery, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return {
        success: true,
        message: 'Si cette adresse email existe, un lien de réinitialisation vous a été envoyé.',
      };
    }

    const user = userResult.rows[0];

    // Vérifier que le compte est actif
    if (!user.is_active) {
      return {
        success: false,
        message: 'Ce compte est désactivé. Contactez un administrateur.',
      };
    }

    // Générer le token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION);

    // Invalider les anciens tokens non utilisés de cet utilisateur
    await client.query(
      'UPDATE password_reset_tokens SET used = true WHERE admin_user_id = $1 AND used = false',
      [user.id]
    );

    // Créer le nouveau token
    await client.query(
      `INSERT INTO password_reset_tokens (admin_user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, token, expiresAt, ipAddress, userAgent]
    );

    return {
      success: true,
      message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      token,
    };
  } catch (error) {
    console.error('Error creating password reset token:', error);
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  } finally {
    await client.end();
  }
}

/**
 * Vérifier qu'un token de réinitialisation est valide
 */
export async function verifyResetToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  email?: string;
  name?: string;
  message?: string;
}> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Récupérer le token avec les infos utilisateur
    const query = `
      SELECT t.admin_user_id, t.expires_at, t.used, u.email, u.name, u.is_active
      FROM password_reset_tokens t
      JOIN admin_users u ON t.admin_user_id = u.id
      WHERE t.token = $1
    `;
    const result = await client.query(query, [token]);

    if (result.rows.length === 0) {
      return {
        valid: false,
        message: 'Lien de réinitialisation invalide.',
      };
    }

    const tokenData = result.rows[0];

    // Vérifier si le token a déjà été utilisé
    if (tokenData.used) {
      return {
        valid: false,
        message: 'Ce lien a déjà été utilisé.',
      };
    }

    // Vérifier si le token a expiré
    if (new Date(tokenData.expires_at) < new Date()) {
      return {
        valid: false,
        message: 'Ce lien a expiré. Veuillez en demander un nouveau.',
      };
    }

    // Vérifier que le compte est toujours actif
    if (!tokenData.is_active) {
      return {
        valid: false,
        message: 'Ce compte est désactivé. Contactez un administrateur.',
      };
    }

    return {
      valid: true,
      userId: tokenData.admin_user_id,
      email: tokenData.email,
      name: tokenData.name,
    };
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return {
      valid: false,
      message: 'Erreur lors de la vérification du lien.',
    };
  } finally {
    await client.end();
  }
}

/**
 * Réinitialiser le mot de passe avec un token valide
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string
): Promise<PasswordResetResult> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Vérifier le token
    const verification = await verifyResetToken(token);

    if (!verification.valid) {
      return {
        success: false,
        message: verification.message || 'Token invalide.',
      };
    }

    // Valider le nouveau mot de passe
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères.',
      };
    }

    await client.connect();

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    await client.query(
      'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, verification.userId]
    );

    // Marquer le token comme utilisé
    await client.query(
      'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE token = $1',
      [token]
    );

    // Invalider toutes les sessions actives de cet utilisateur (sécurité)
    await client.query(
      'DELETE FROM admin_sessions WHERE admin_user_id = $1',
      [verification.userId]
    );

    // Logger l'action (optionnel)
    try {
      await client.query(
        `INSERT INTO audit_logs (admin_user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          verification.userId,
          'auth:password_reset',
          'auth',
          verification.userId,
          JSON.stringify({ email: verification.email }),
          ipAddress,
          userAgent,
        ]
      );
    } catch (auditError) {
      console.error('Failed to log password reset:', auditError);
      // Ne pas bloquer si le log échoue
    }

    return {
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès.',
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: 'Une erreur est survenue lors de la réinitialisation.',
    };
  } finally {
    await client.end();
  }
}

/**
 * Nettoyer les tokens expirés (à appeler périodiquement)
 */
export async function cleanExpiredTokens(): Promise<number> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Supprimer les tokens expirés ou utilisés depuis plus de 7 jours
    const result = await client.query(`
      DELETE FROM password_reset_tokens 
      WHERE expires_at < NOW() 
         OR (used = true AND used_at < NOW() - INTERVAL '7 days')
    `);

    return result.rowCount || 0;
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
    return 0;
  } finally {
    await client.end();
  }
}
