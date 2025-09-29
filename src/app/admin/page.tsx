'use client';

import { useState, useEffect } from 'react';

interface Request {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite_actuelle: string;
  specialite_souhaitee: string;
  raison: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [adminName, setAdminName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (retry = false) => {
    try {
      setError(null);
      if (!retry) {
        setLoading(true);
      }
      
      const response = await fetch('/api/admin/requests');
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
        setRetryCount(0); // Reset retry count on success
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Erreur HTTP ${response.status}`;
        
        console.error('Admin requests error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        setError(`Erreur lors du chargement des demandes: ${errorMessage}`);
        
        // If it's a server error and we haven't retried too many times, suggest retry
        if (response.status >= 500 && retryCount < 3) {
          setError(`${errorMessage} (Tentative ${retryCount + 1}/3)`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setError('Erreur de connexion à la base de données. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  const retryFetchRequests = async () => {
    setRetryCount(prev => prev + 1);
    await fetchRequests(true);
  };

  const handleRefreshClick = () => {
    fetchRequests();
  };

  const handleRetryClick = () => {
    retryFetchRequests();
  };

  const updateRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
    if (!adminName.trim()) {
      alert('Veuillez saisir votre nom d\'administrateur');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          adminComment: adminComment.trim() || undefined,
          adminName: adminName.trim(),
        }),
      });

      if (response.ok) {
        alert(`Demande ${status === 'approved' ? 'approuvée' : 'refusée'} avec succès!`);
        setSelectedRequest(null);
        setAdminComment('');
        await fetchRequests(); // Refresh the list
      } else {
        alert('Erreur lors de la mise à jour de la demande');
      }
    } catch (error) {
      console.error('Failed to update request:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Refusée';
      default: return 'En attente';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Chargement des demandes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-8 border border-red-500/30 max-w-md w-full text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-4">Erreur de chargement</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetryClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? 'Limite de tentatives atteinte' : `Réessayer (${retryCount + 1}/3)`}
            </button>
            {retryCount >= 3 && (
              <button
                onClick={handleRefreshClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Actualiser la page
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Administration USTHB</h1>
              <p className="text-gray-300 mt-2">Gestion des demandes de changement de spécialité</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">Total: {requests.length}</p>
              <p className="text-gray-300 text-sm">
                En attente: {requests.filter(r => r.status === 'pending').length} |
                Approuvées: {requests.filter(r => r.status === 'approved').length} |
                Refusées: {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requests List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Demandes</h2>
              <button
                onClick={handleRefreshClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                Actualiser
              </button>
            </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📋</div>
                    <p className="text-gray-400">Aucune demande trouvée</p>
                    <p className="text-gray-500 text-sm mt-2">Les nouvelles demandes apparaîtront ici</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedRequest?.id === request.id
                          ? 'bg-white/20 border-purple-400'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-white font-semibold">
                            {request.prenom} {request.nom}
                          </h3>
                          <p className="text-gray-300 text-sm">Matricule: {request.matricule}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        <p>De: {request.specialite_actuelle} → Vers: {request.specialite_souhaitee}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(request.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="lg:col-span-1">
            {selectedRequest ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Détails de la demande</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Étudiant</label>
                    <p className="text-white">{selectedRequest.prenom} {selectedRequest.nom}</p>
                    <p className="text-gray-400 text-sm">Matricule: {selectedRequest.matricule}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <p className="text-white">{selectedRequest.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone</label>
                    <p className="text-white">{selectedRequest.telephone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Changement demandé</label>
                    <p className="text-white">
                      {selectedRequest.specialite_actuelle} → {selectedRequest.specialite_souhaitee}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Raison</label>
                    <p className="text-white text-sm">{selectedRequest.raison}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Statut actuel</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>

                  {selectedRequest.status === 'pending' && (
                    <div className="space-y-4 pt-4 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Votre nom (administrateur)</label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Nom de l'administrateur"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Commentaire (optionnel)</label>
                        <textarea
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows={3}
                          placeholder="Ajouter un commentaire..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                          disabled={updating}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {updating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Traitement...
                            </>
                          ) : (
                            'Approuver'
                          )}
                        </button>
                        <button
                          onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                          disabled={updating}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {updating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Traitement...
                            </>
                          ) : (
                            'Refuser'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status !== 'pending' && (
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-sm text-gray-400">
                        <p>Traité par: {selectedRequest.reviewed_by}</p>
                        <p>Le: {selectedRequest.reviewed_at ? new Date(selectedRequest.reviewed_at).toLocaleString('fr-FR') : 'N/A'}</p>
                        {selectedRequest.admin_comment && (
                          <div className="mt-2 p-2 bg-white/5 rounded">
                            <p className="text-gray-300">Commentaire: {selectedRequest.admin_comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-center text-gray-400">
                  <p>Sélectionnez une demande pour voir les détails</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}