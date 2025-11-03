'use client';

import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useEffect, useState } from 'react';

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
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const { updateActivity, logout } = useSessionTimeout({
    disabled,
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    checkInterval: 60 * 1000, // Vérifier chaque minute
    refreshThreshold: 5 * 60 * 1000, // Rafraîchir 5 minutes avant expiration
    onBeforeLogout: () => {
      // Optionnel : afficher un avertissement avant déconnexion
      setShowWarning(true);
    },
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

  // Modal d'avertissement (optionnel)
  if (showWarning && timeRemaining !== null && timeRemaining > 0) {
    return (
      <>
        {children}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⏰ Session expirée
            </h3>
            <p className="text-gray-600 mb-4">
              Votre session va expirer dans {Math.ceil(timeRemaining / 60)} minute(s) 
              en raison d&apos;inactivité.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  updateActivity();
                  setShowWarning(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Rester connecté
              </button>
              <button
                onClick={logout}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
