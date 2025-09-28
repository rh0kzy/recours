'use client';

import { useState } from 'react';

export default function UpdateTablePage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const updateTable = async () => {
    setLoading(true);
    setStatus('Mise à jour de la table...');

    try {
      const response = await fetch('/api/update-requests-table', {
        method: 'POST',
      });

      if (response.ok) {
        setStatus('✅ Table mise à jour avec succès!');
      } else {
        setStatus('❌ Erreur lors de la mise à jour');
      }
    } catch (error) {
      setStatus('❌ Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Mise à jour de la base de données
        </h1>

        <button
          onClick={updateTable}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour la table requests'}
        </button>

        {status && (
          <div className="text-center text-white">
            {status}
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/admin"
            className="text-purple-300 hover:text-purple-100 underline"
          >
            Aller à la page admin →
          </a>
        </div>
      </div>
    </div>
  );
}