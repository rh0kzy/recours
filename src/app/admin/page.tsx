'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

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

interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [adminName, setAdminName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationData, setDeleteConfirmationData] = useState<{
    count: number;
    pending: number;
    approved: number;
    rejected: number;
  } | null>(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await response.json();
        setCurrentUser({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        });
      } catch (error) {
        console.error('Session check failed:', error);
        router.push('/admin/login');
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Fonctions de gestion des notifications
  const addNotification = (type: Notification['type'], title: string, message: string, duration = 5000) => {
    const newNotification: Notification = {
      id: Date.now(),
      type,
      title,
      message,
      duration
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-suppression après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, duration);
    }
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (title: string, message: string) => addNotification('success', title, message);
  const showError = (title: string, message: string) => addNotification('error', title, message);
  const showInfo = (title: string, message: string) => addNotification('info', title, message);
  const showWarning = (title: string, message: string) => addNotification('warning', title, message);

  // Fonction utilitaire pour formater les dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de date/heure:', error);
      return 'Date invalide';
    }
  };

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

  const handleSelectionModeToggle = () => {
    setSelectionMode(!selectionMode);
    setSelectedRequests([]);
    // Clear selected request when entering selection mode
    if (!selectionMode) {
      setSelectedRequest(null);
    }
  };

  const handleRequestSelect = (requestId: number, event?: React.MouseEvent) => {
    // Prevent event bubbling to avoid conflicts with detail view
    event?.stopPropagation();
    
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    const allRequestsSelected = requests.every(request => 
      selectedRequests.includes(request.id)
    );
    
    if (allRequestsSelected && requests.length > 0) {
      // Deselect all requests
      setSelectedRequests([]);
    } else {
      // Select all requests (all statuses)
      const allIds = requests.map(r => r.id);
      setSelectedRequests(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRequests.length === 0) {
      showWarning('Sélection requise', 'Veuillez sélectionner au moins une demande à supprimer.');
      return;
    }

    // Categorize selected requests by status
    const selectedRequestsData = selectedRequests.map(id => 
      requests.find(r => r.id === id)
    ).filter((r): r is Request => r !== undefined);

    const pendingCount = selectedRequestsData.filter(r => r.status === 'pending').length;
    const approvedCount = selectedRequestsData.filter(r => r.status === 'approved').length;
    const rejectedCount = selectedRequestsData.filter(r => r.status === 'rejected').length;

    // Prepare confirmation data and show modal
    setDeleteConfirmationData({
      count: selectedRequests.length,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    });
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      setShowDeleteConfirmation(false);
      
      const deletePromises = selectedRequests.map(id =>
        fetch(`/api/admin/requests/${id}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter(result => !result.ok);

      if (failedDeletes.length > 0) {
        showError('Suppression partielle', `Erreur lors de la suppression de ${failedDeletes.length} demande(s).`);
      } else {
        showSuccess('Suppression réussie', `${selectedRequests.length} demande(s) supprimée(s) avec succès.`);
        setSelectedRequests([]);
        setSelectionMode(false);
        fetchRequests(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting requests:', error);
      showError('Erreur de suppression', 'Erreur lors de la suppression des demandes.');
    } finally {
      setDeleteConfirmationData(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmationData(null);
  };

  const handleRetryClick = () => {
    retryFetchRequests();
  };

  const updateRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
    if (!adminName.trim()) {
      showWarning('Nom requis', 'Veuillez saisir votre nom d\'administrateur');
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
        const responseData = await response.json();
        
        if (status === 'approved' && selectedRequest) {
          showSuccess(
            'Demande approuvée & Transfert effectué', 
            `L'étudiant a été automatiquement transféré vers ${selectedRequest.specialite_souhaitee}. Email de confirmation envoyé.`
          );
        } else {
          showSuccess(
            'Demande refusée', 
            'La demande a été refusée. Email de notification envoyé à l\'étudiant.'
          );
        }
        
        setSelectedRequest(null);
        setAdminComment('');
        await fetchRequests(); // Refresh the list
      } else {
        showError('Erreur de mise à jour', 'Erreur lors de la mise à jour de la demande');
      }
    } catch (error) {
      console.error('Failed to update request:', error);
      showError('Erreur de connexion', 'Erreur lors de la mise à jour');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-lg sm:text-xl">Chargement des demandes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-red-500/30 max-w-md w-full text-center">
          <div className="text-red-400 text-5xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Erreur de chargement</h2>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetryClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? 'Limite de tentatives atteinte' : `Réessayer (${retryCount + 1}/3)`}
            </button>
            {retryCount >= 3 && (
              <button
                onClick={handleRefreshClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
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
      {/* Admin Header */}
      {currentUser && <AdminHeader user={currentUser} />}
      
      {/* Système de notifications */}
      <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 space-y-3 max-w-sm sm:max-w-sm mx-auto sm:mx-0">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border backdrop-blur-sm shadow-xl transform transition-all duration-300 ease-in-out ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border-green-500/50 text-green-100'
                : notification.type === 'error'
                ? 'bg-red-500/20 border-red-500/50 text-red-100'
                : notification.type === 'warning'
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100'
                : 'bg-blue-500/20 border-blue-500/50 text-blue-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-lg flex-shrink-0">
                  {notification.type === 'success' ? '✅' : 
                   notification.type === 'error' ? '❌' : 
                   notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-xs mt-1 opacity-90">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src="/logo-usthb.png"
                alt="Université des Sciences et de Technologie Houari Boumediene"
                className="h-12 sm:h-16 w-auto"
              />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  <span className="block sm:hidden">USTHB - Admin</span>
                  <span className="hidden sm:block">Faculté Informatique - USTHB</span>
                </h1>
                <p className="text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
                  <span className="block sm:hidden">Gestion des demandes</span>
                  <span className="hidden sm:block">Gestion des demandes de changement de spécialité</span>
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <p className="text-white font-semibold text-sm sm:text-base">Total: {requests.length}</p>
              <div className="text-gray-300 text-xs sm:text-sm flex flex-wrap gap-2 sm:block">
                <span>En attente: {requests.filter(r => r.status === 'pending').length}</span>
                <span className="hidden sm:inline"> | </span>
                <span>Approuvées: {requests.filter(r => r.status === 'approved').length}</span>
                <span className="hidden sm:inline"> | </span>
                <span>Refusées: {requests.filter(r => r.status === 'rejected').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Requests List */}
          <div className="xl:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Demandes</h2>
                    {selectionMode && (
                      <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                        <span className="text-blue-300 text-sm font-medium">
                          {selectedRequests.length} sélectionnée(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Boutons de contrôle intégrés dans la carte */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {/* Boutons de contrôle principal */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleRefreshClick}
                        disabled={selectionMode}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        <span className="text-lg">🔄</span>
                        <span>Actualiser</span>
                      </button>
                      
                      <button
                        onClick={handleSelectionModeToggle}
                        className={`px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${
                          selectionMode 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white ring-2 ring-blue-400/50' 
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                        }`}
                      >
                        <span className="text-lg">{selectionMode ? '✅' : '☑️'}</span>
                        <span className="hidden sm:inline">
                          {selectionMode ? 'Annuler sélection' : 'Mode sélection'}
                        </span>
                        <span className="sm:hidden">
                          {selectionMode ? 'Annuler' : 'Sélect.'}
                        </span>
                      </button>
                    </div>
                    
                    {/* Boutons de sélection et suppression */}
                    {selectionMode && (
                      <div className="flex gap-2 border-l border-white/20 pl-3">
                        <button
                          onClick={handleSelectAll}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <span className="text-lg">{
                            requests.every(r => selectedRequests.includes(r.id)) 
                            && requests.length > 0
                            ? '☑️' : '⬜'
                          }</span>
                          <span className="hidden sm:inline">
                            {requests.every(r => selectedRequests.includes(r.id)) && requests.length > 0 
                              ? 'Désélectionner tout' : 'Tout sélectionner'}
                          </span>
                          <span className="sm:hidden">Tout</span>
                        </button>
                        
                        <button
                          onClick={handleDeleteSelected}
                          disabled={selectedRequests.length === 0}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                        >
                          <span className="text-lg">🗑️</span>
                          <span className="hidden sm:inline">
                            {selectedRequests.length > 0 ? `Supprimer (${selectedRequests.length})` : 'Supprimer sélection'}
                          </span>
                          <span className="sm:hidden">
                            {selectedRequests.length > 0 ? `Sup. (${selectedRequests.length})` : 'Sup.'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>              <div className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-[500px] overflow-y-auto">
                {selectionMode && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 text-xl">ℹ️</span>
                      <div>
                        <p className="text-blue-300 text-sm font-semibold">Mode de sélection activé</p>
                        <p className="text-blue-200/80 text-xs mt-1">
                          Vous pouvez maintenant sélectionner et supprimer toutes les demandes, 
                          quel que soit leur statut (en attente, approuvées ou rejetées).
                        </p>
                        {selectedRequests.length > 0 && (
                          <div className="mt-2 text-xs text-blue-300">
                            <span className="font-medium">{selectedRequests.length} demande(s) sélectionnée(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {requests.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-gray-400 text-3xl sm:text-4xl mb-4">📋</div>
                    <p className="text-gray-400 text-sm sm:text-base">Aucune demande trouvée</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">Les nouvelles demandes apparaîtront ici</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-3 sm:p-4 rounded-lg border transition-all ${
                        selectedRequest?.id === request.id && !selectionMode
                          ? 'bg-white/20 border-purple-400 ring-2 ring-purple-400/50'
                          : selectedRequests.includes(request.id) && selectionMode
                          ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      } ${selectionMode ? 'cursor-default' : 'cursor-pointer'}`}
                      onClick={() => {
                        if (!selectionMode) {
                          setSelectedRequest(request);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                          {selectionMode && (
                            <div 
                              className="flex items-center justify-center"
                              onClick={(e) => handleRequestSelect(request.id, e)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedRequests.includes(request.id)}
                                onChange={() => {}} // Controlled by parent click
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0 cursor-pointer"
                              />
                            </div>
                          )}
                          {!selectionMode && (
                            <div className="flex items-center justify-center flex-shrink-0">
                              <img
                                src="/logo-usthb.png"
                                alt="USTHB"
                                className="h-8 w-8 sm:h-10 sm:w-10 object-contain opacity-80"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                                {request.prenom} {request.nom}
                              </h3>
                              {request.status !== 'pending' && selectionMode && (
                                <span className="text-xs text-gray-400 bg-gray-600/50 px-2 py-1 rounded">
                                  Déjà traité
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm">Matricule: {request.matricule}</p>
                          </div>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(request.status)}`}>
                          <span className="hidden sm:inline">{getStatusText(request.status)}</span>
                          <span className="sm:hidden">
                            {request.status === 'approved' ? '✅' : request.status === 'rejected' ? '❌' : '⏳'}
                          </span>
                        </span>
                      </div>
                      <div className="text-gray-300 text-xs sm:text-sm ml-0 sm:ml-7">
                        <p className="truncate">
                          <span className="hidden sm:inline">De: {request.specialite_actuelle} → Vers: {request.specialite_souhaitee}</span>
                          <span className="sm:hidden">{request.specialite_actuelle} → {request.specialite_souhaitee}</span>
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="xl:col-span-1">
            {selectedRequest ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    <span className="hidden sm:inline">Détails de la demande</span>
                    <span className="sm:hidden">Détails</span>
                  </h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="Fermer"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Étudiant</label>
                    <p className="text-white text-sm sm:text-base">{selectedRequest.prenom} {selectedRequest.nom}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Matricule: {selectedRequest.matricule}</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Email</label>
                    <p className="text-white text-sm sm:text-base break-all">{selectedRequest.email}</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Téléphone</label>
                    <p className="text-white text-sm sm:text-base">{selectedRequest.telephone}</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Changement demandé</label>
                    <p className="text-white text-sm sm:text-base">
                      {selectedRequest.specialite_actuelle} → {selectedRequest.specialite_souhaitee}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Raison</label>
                    <p className="text-white text-xs sm:text-sm break-words">{selectedRequest.raison}</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Statut actuel</label>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>

                  {selectedRequest.status === 'pending' && (
                    <div className="space-y-3 sm:space-y-4 pt-4 border-t border-white/20">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Votre nom (administrateur)</label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                          placeholder="Nom de l'administrateur"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Commentaire (optionnel)</label>
                        <textarea
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm sm:text-base"
                          rows={3}
                          placeholder="Ajouter un commentaire..."
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                          disabled={updating}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                        >
                          {updating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Traitement...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg">✅</span>
                              <span>Approuver</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                          disabled={updating}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                        >
                          {updating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Traitement...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg">❌</span>
                              <span>Refuser</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status !== 'pending' && (
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                        <p>Traité par: {selectedRequest.reviewed_by}</p>
                        <p>Le: {formatDateTime(selectedRequest.reviewed_at)}</p>
                        {selectedRequest.admin_comment && (
                          <div className="mt-2 p-2 bg-white/5 rounded">
                            <p className="text-gray-300 break-words">Commentaire: {selectedRequest.admin_comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="text-center text-gray-400">
                  <div className="text-3xl sm:text-4xl mb-3">👆</div>
                  <p className="text-sm sm:text-base">
                    <span className="hidden sm:inline">Sélectionnez une demande pour voir les détails</span>
                    <span className="sm:hidden">Sélectionnez une demande</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirmation && deleteConfirmationData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-red-500/30 max-w-md w-full transform transition-all duration-300 ease-out scale-100">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirmation de suppression</h3>
                  <p className="text-sm text-gray-400">Cette action est irréversible</p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-white mb-3">
                  Êtes-vous sûr de vouloir supprimer définitivement{' '}
                  <span className="font-semibold text-red-400">
                    {deleteConfirmationData.count} demande(s)
                  </span> ?
                </p>

                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-sm font-medium text-gray-300 mb-2">Détails :</p>
                  <div className="space-y-1 text-sm">
                    {deleteConfirmationData.pending > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                        <span className="text-gray-300">
                          {deleteConfirmationData.pending} demande(s) en attente
                        </span>
                      </div>
                    )}
                    {deleteConfirmationData.approved > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <span className="text-gray-300">
                          {deleteConfirmationData.approved} demande(s) approuvée(s)
                        </span>
                      </div>
                    )}
                    {deleteConfirmationData.rejected > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        <span className="text-gray-300">
                          {deleteConfirmationData.rejected} demande(s) rejetée(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">⚠️</span>
                    <span className="text-red-300 text-sm font-medium">Cette action est irréversible !</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}