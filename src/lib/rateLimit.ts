// Rate limiting utility for login attempts
// Prevents brute force attacks by limiting attempts per IP and per user

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAttempt: number;
}

// In-memory store (pour production, utiliser Redis)
const ipStore = new Map<string, RateLimitEntry>();
const emailStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS_PER_IP = 10; // Max 10 tentatives par IP
const MAX_ATTEMPTS_PER_EMAIL = 5; // Max 5 tentatives par email
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const IP_BLOCK_DURATION = 15 * 60 * 1000; // Bloquer IP pour 15 min
const EMAIL_BLOCK_DURATION = 30 * 60 * 1000; // Bloquer email pour 30 min

/**
 * Nettoie les entrées expirées
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  
  // Nettoyer les IPs expirées
  for (const [key, value] of ipStore.entries()) {
    if (now > value.resetTime) {
      ipStore.delete(key);
    }
  }
  
  // Nettoyer les emails expirés
  for (const [key, value] of emailStore.entries()) {
    if (now > value.resetTime) {
      emailStore.delete(key);
    }
  }
}

/**
 * Vérifie si une IP est rate limitée
 */
export function checkIpRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts?: number;
  resetTime?: number;
  blockedUntil?: number;
} {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const entry = ipStore.get(ip);
  
  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS_PER_IP };
  }
  
  // Si bloqué, vérifier si le blocage est expiré
  if (entry.count >= MAX_ATTEMPTS_PER_IP) {
    if (now < entry.resetTime) {
      return {
        allowed: false,
        blockedUntil: entry.resetTime,
        remainingAttempts: 0,
      };
    } else {
      // Reset après expiration
      ipStore.delete(ip);
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS_PER_IP };
    }
  }
  
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS_PER_IP - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Vérifie si un email est rate limité
 */
export function checkEmailRateLimit(email: string): {
  allowed: boolean;
  remainingAttempts?: number;
  resetTime?: number;
  blockedUntil?: number;
} {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const entry = emailStore.get(email.toLowerCase());
  
  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS_PER_EMAIL };
  }
  
  // Si bloqué, vérifier si le blocage est expiré
  if (entry.count >= MAX_ATTEMPTS_PER_EMAIL) {
    if (now < entry.resetTime) {
      return {
        allowed: false,
        blockedUntil: entry.resetTime,
        remainingAttempts: 0,
      };
    } else {
      // Reset après expiration
      emailStore.delete(email.toLowerCase());
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS_PER_EMAIL };
    }
  }
  
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS_PER_EMAIL - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Enregistre une tentative de connexion échouée
 */
export function recordFailedAttempt(ip: string, email: string): void {
  const now = Date.now();
  
  // Enregistrer pour l'IP
  const ipEntry = ipStore.get(ip);
  if (ipEntry) {
    ipEntry.count++;
    ipEntry.lastAttempt = now;
    if (ipEntry.count >= MAX_ATTEMPTS_PER_IP) {
      ipEntry.resetTime = now + IP_BLOCK_DURATION;
    }
  } else {
    ipStore.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
      lastAttempt: now,
    });
  }
  
  // Enregistrer pour l'email
  const emailKey = email.toLowerCase();
  const emailEntry = emailStore.get(emailKey);
  if (emailEntry) {
    emailEntry.count++;
    emailEntry.lastAttempt = now;
    if (emailEntry.count >= MAX_ATTEMPTS_PER_EMAIL) {
      emailEntry.resetTime = now + EMAIL_BLOCK_DURATION;
    }
  } else {
    emailStore.set(emailKey, {
      count: 1,
      resetTime: now + WINDOW_MS,
      lastAttempt: now,
    });
  }
}

/**
 * Réinitialise le compteur pour une connexion réussie
 */
export function resetRateLimit(ip: string, email: string): void {
  ipStore.delete(ip);
  emailStore.delete(email.toLowerCase());
}

/**
 * Formate le temps restant en message lisible
 */
export function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.ceil(milliseconds / 60000);
  if (minutes < 1) {
    return 'moins d\'une minute';
  } else if (minutes === 1) {
    return '1 minute';
  } else {
    return `${minutes} minutes`;
  }
}

/**
 * Obtient des statistiques sur le rate limiting
 */
export function getRateLimitStats() {
  return {
    blockedIps: Array.from(ipStore.entries())
      .filter(([, entry]) => entry.count >= MAX_ATTEMPTS_PER_IP)
      .map(([ip, entry]) => ({
        ip,
        attempts: entry.count,
        blockedUntil: new Date(entry.resetTime).toISOString(),
      })),
    blockedEmails: Array.from(emailStore.entries())
      .filter(([, entry]) => entry.count >= MAX_ATTEMPTS_PER_EMAIL)
      .map(([email, entry]) => ({
        email,
        attempts: entry.count,
        blockedUntil: new Date(entry.resetTime).toISOString(),
      })),
    totalBlockedIps: Array.from(ipStore.values()).filter(
      (e) => e.count >= MAX_ATTEMPTS_PER_IP
    ).length,
    totalBlockedEmails: Array.from(emailStore.values()).filter(
      (e) => e.count >= MAX_ATTEMPTS_PER_EMAIL
    ).length,
  };
}
