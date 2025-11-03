'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { AdminRole } from '@/lib/permissions';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'viewer' | 'reviewer' | 'super_admin' | 'department_admin';
  department?: string;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at?: string;
}

interface CurrentUser {
  name: string;
  email: string;
  role: AdminRole;
}

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as User['role'],
    department: '',
  });

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await response.json();
        
        // Only super_admin can access this page
        if (data.user.role !== 'super_admin') {
          router.push('/admin');
          return;
        }
        
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

  // Fetch users
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
      setError(null);
    } catch (err) {
      setError('Échec du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'viewer', department: '' });
      fetchUsers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      alert(errorMessage);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'viewer', department: '' });
      fetchUsers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      fetchUsers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      alert(errorMessage);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      if (!response.ok) throw new Error('Failed to update user');
      fetchUsers();
    } catch (err) {
      alert('Échec de la mise à jour du statut');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'department_admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'reviewer': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'viewer': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'department_admin': return 'Admin Département';
      case 'reviewer': return 'Examinateur';
      case 'viewer': return 'Observateur';
      default: return role;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminHeader user={currentUser} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24 md:pt-28">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Gestion des Utilisateurs</h1>
            <p className="text-sm sm:text-base text-gray-300">Gérer les comptes administrateurs et leurs permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/20 text-sm sm:text-base"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nouvel Utilisateur</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center text-white py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-white"></div>
            <p className="mt-4 text-sm sm:text-base">Chargement des utilisateurs...</p>
          </div>
        ) : (
          /* Users table - Desktop */
          <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-white">Nom</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-white">Email</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-white">Rôle</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-white">Département</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-white">Statut</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white text-sm lg:text-base">{user.name}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">{user.email}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                          {user.department || '-'}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${
                              user.is_active
                                ? 'bg-green-500/20 text-green-300 border-green-500/50'
                                : 'bg-red-500/20 text-red-300 border-red-500/50'
                            }`}
                          >
                            {user.is_active ? '✓ Actif' : '✗ Inactif'}
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm transition-colors"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm transition-colors"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    Aucun utilisateur trouvé
                  </div>
                )}
              </div>
            </div>

            {/* Mobile View - Card Layout */}
            <div className="md:hidden space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base truncate">{user.name}</h3>
                      <p className="text-gray-300 text-sm truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`ml-2 flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        user.is_active
                          ? 'bg-green-500/20 text-green-300 border-green-500/50'
                          : 'bg-red-500/20 text-red-300 border-red-500/50'
                      }`}
                    >
                      {user.is_active ? '✓' : '✗'}
                    </button>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">Rôle:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    {user.department && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">Département:</span>
                        <span className="text-gray-300 text-xs">{user.department}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors font-medium"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-4 sm:p-6 border border-white/20 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              {editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
            </h2>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Mot de passe {editingUser && <span className="text-gray-400">(laisser vide pour ne pas modifier)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Rôle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="viewer">Observateur</option>
                    <option value="reviewer">Examinateur</option>
                    <option value="department_admin">Admin Département</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {formData.role === 'department_admin' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Département
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                      placeholder="ex: Informatique"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', password: '', role: 'viewer', department: '' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
