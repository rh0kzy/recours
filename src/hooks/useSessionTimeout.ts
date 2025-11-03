'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UseSessionTimeoutOptions {
  /**
   * Durée d'inactivité avant déconnexion (en millisecondes)
   * Par défaut: 30 minutes
   */
  inactivityTimeout?: number;
  
  /**
   * Intervalle pour vérifier la session (en millisecondes)
   * Par défaut: 1 minute
   */
  checkInterval?: number;
  
  /**
   * Temps avant expiration pour rafraîchir (en millisecondes)
   * Par défaut: 5 minutes
   */
  refreshThreshold?: number;
  
  /**
   * Callback appelé avant la déconnexion
   */
  onBeforeLogout?: () => void;
  
  /**
   * Désactiver le hook (utile pour la page de login)
   */
  disabled?: boolean;
}

const DEFAULT_INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const DEFAULT_CHECK_INTERVAL = 60 * 1000; // 1 minute
const DEFAULT_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes avant expiration

/**
 * Hook pour gérer le timeout de session automatique
 * - Détecte l'inactivité utilisateur
 * - Rafraîchit automatiquement le token
 * - Déconnecte après 30 minutes d'inactivité
 */
export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    inactivityTimeout = DEFAULT_INACTIVITY_TIMEOUT,
    checkInterval = DEFAULT_CHECK_INTERVAL,
    refreshThreshold = DEFAULT_REFRESH_THRESHOLD,
    onBeforeLogout,
    disabled = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  
  const lastActivityRef = useRef<number>(Date.now());
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Mettre à jour le timestamp de dernière activité
   */
  const updateActivity = useCallback(() => {
    if (disabled) return;
    lastActivityRef.current = Date.now();
  }, [disabled]);

  /**
   * Rafraîchir le token de session
   */
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }

      console.log('✅ Session refreshed successfully');
      updateActivity();
    } catch (error) {
      console.error('❌ Failed to refresh session:', error);
      // Si le rafraîchissement échoue, déconnecter
      handleLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateActivity]);

  /**
   * Vérifier si la session est toujours valide
   */
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      if (!response.ok || !(await response.json()).authenticated) {
        console.log('⚠️ Session expired or invalid');
        handleLogout();
      }
    } catch (error) {
      console.error('❌ Session check failed:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Gérer la déconnexion
   */
  const handleLogout = useCallback(async () => {
    if (onBeforeLogout) {
      onBeforeLogout();
    }

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Nettoyer les timers
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Rediriger vers login
      router.push('/admin/login?reason=session_expired');
    }
  }, [router, onBeforeLogout]);

  /**
   * Vérifier l'inactivité
   */
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Si inactif depuis plus de 30 minutes, déconnecter
    if (timeSinceLastActivity >= inactivityTimeout) {
      console.log('⏰ Inactive for 30 minutes, logging out...');
      handleLogout();
      return;
    }

    // Si proche de l'expiration, rafraîchir le token
    const timeUntilInactive = inactivityTimeout - timeSinceLastActivity;
    if (timeUntilInactive <= refreshThreshold) {
      console.log('🔄 Session expiring soon, refreshing...');
      refreshSession();
    }
  }, [inactivityTimeout, refreshThreshold, handleLogout, refreshSession]);

  /**
   * Initialiser les event listeners pour détecter l'activité
   */
  useEffect(() => {
    if (disabled) return;

    // Liste des événements qui indiquent une activité utilisateur
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle pour éviter trop d'updates
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledUpdateActivity = () => {
      if (!throttleTimeout) {
        updateActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000); // Update max 1 fois par seconde
      }
    };

    // Ajouter les listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledUpdateActivity);
    });

    // Vérification périodique de la session
    sessionCheckIntervalRef.current = setInterval(() => {
      checkInactivity();
      checkSession();
    }, checkInterval);

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledUpdateActivity);
      });

      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }

      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [disabled, updateActivity, checkInactivity, checkSession, checkInterval]);

  /**
   * Initialiser la dernière activité au chargement de la page
   */
  useEffect(() => {
    if (!disabled) {
      updateActivity();
    }
  }, [pathname, disabled, updateActivity]);

  return {
    updateActivity,
    refreshSession,
    logout: handleLogout,
  };
}
