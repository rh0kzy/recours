'use client';

import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();

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

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 shadow-2xl backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-8">
        {/* Main navbar content */}
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  USTHB Recours
                </h1>
                <p className="text-xs text-gray-400 font-medium">Tableau de bord</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/dashboard')
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <svg className={`h-5 w-5 transition-transform duration-200 ${isActive('/admin/dashboard') ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Dashboard</span>
                {isActive('/admin/dashboard') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></span>
                )}
              </button>

              <button
                onClick={() => router.push('/admin')}
                className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <svg className={`h-5 w-5 transition-transform duration-200 ${isActive('/admin') ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Demandes</span>
                {isActive('/admin') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></span>
                )}
              </button>
              
              {user.role === 'super_admin' && (
                <button
                  onClick={() => router.push('/admin/users')}
                  className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive('/admin/users')
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <svg className={`h-5 w-5 transition-transform duration-200 ${isActive('/admin/users') ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Utilisateurs</span>
                  {isActive('/admin/users') && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></span>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* Right: User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* User Profile Card */}
            <div className="hidden lg:flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-2.5 hover:border-gray-600/50 transition-all duration-200">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg blur opacity-30"></div>
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              </div>
              
              {/* User Details */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-white">{user.name}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${roleColors[roleColor as keyof typeof roleColors]}`}>
                    {getRoleIcon(user.role)} {getRoleLabel(user.role)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{user.email}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block h-10 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 shadow-lg shadow-red-500/5 hover:shadow-red-500/10"
              title="Se déconnecter"
            >
              <svg className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Bottom section */}
      <div className="md:hidden border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => router.push('/admin')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all ${
              isActive('/admin')
                ? 'text-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-medium">Demandes</span>
          </button>
          
          {user.role === 'super_admin' && (
            <button
              onClick={() => router.push('/admin/users')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all ${
                isActive('/admin/users')
                  ? 'text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs font-medium">Utilisateurs</span>
            </button>
          )}
          
          {/* Mobile User Info */}
          <div className="flex flex-col items-center space-y-1 px-4 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-300">{user.name.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
