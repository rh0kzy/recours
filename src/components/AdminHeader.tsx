'use client';

import { useRouter } from 'next/navigation';
import { getRoleLabel, getRoleIcon, getRoleColor } from '@/lib/permissions';
import type { AdminRole } from '@/lib/permissions';

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
    role: AdminRole;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const roleColor = getRoleColor(user.role);
  const roleColors = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left: Title & Navigation */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Gestion des demandes de changement de spécialité</p>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              📋 Demandes
            </button>
            {user.role === 'super_admin' && (
              <button
                onClick={() => router.push('/admin/users')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                👥 Utilisateurs
              </button>
            )}
          </nav>
        </div>

        {/* Right: User Info & Logout */}
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-white">{user.name}</div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${roleColors[roleColor as keyof typeof roleColors]}`}>
                {getRoleIcon(user.role)} {getRoleLabel(user.role)}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700"></div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 transition-all"
            title="Se déconnecter"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
