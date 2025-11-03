'use client';

import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useEffect } from 'react';

interface SessionManagerProps {
  children: React.ReactNode;
  /**
   * Désactiver le gestionnaire de session (pour la page de login)
   */
  disabled?: boolean;
}

/**
 * Composant pour gérer automatiquement le timeout de session
 * À utiliser dans le layout admin
 */
export function SessionManager({ children, disabled = false }: SessionManagerProps) {
  const { updateActivity } = useSessionTimeout({
    disabled,
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    checkInterval: 60 * 1000, // Vérifier chaque minute
    refreshThreshold: 5 * 60 * 1000, // Rafraîchir 5 minutes avant expiration
  });

  // Optionnel : afficher un avertissement 2 minutes avant la déconnexion
  useEffect(() => {
    if (disabled) return;

    const warningInterval = setInterval(() => {
      // Cette logique peut être améliorée pour calculer le temps restant réel
      // Pour l'instant, c'est juste un exemple
    }, 60000); // Vérifier chaque minute

    return () => clearInterval(warningInterval);
  }, [disabled]);

  // Pas de modal d'avertissement, seulement les enfants
  return (
    <div
      onMouseMove={updateActivity}
      onKeyDown={updateActivity}
      onScroll={updateActivity}
      onClick={updateActivity}
    >
      {children}
    </div>
  );
}
