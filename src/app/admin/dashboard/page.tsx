'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import RequestsChart from '@/components/dashboard/RequestsChart';
import ApprovalRateChart from '@/components/dashboard/ApprovalRateChart';
import SpecialtyChart from '@/components/dashboard/SpecialtyChart';
import type { AdminRole } from '@/lib/permissions';

interface AdminUser {
  name: string;
  email: string;
  role: AdminRole;
}

interface Statistics {
  overview: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
    last30Days: number;
    last7Days: number;
    averageProcessingTime: number;
  };
  charts: {
    byDay: Array<{ date: string; demandes: number }>;
    byWeek: Array<{ week: string; demandes: number }>;
    byMonth: Array<{ month: string; demandes: number }>;
    byCurrentSpecialty: Array<{ name: string; value: number }>;
    byDesiredSpecialty: Array<{ name: string; value: number }>;
    statusDistribution: Array<{
      name: string;
      value: number;
      fill: string;
    }>;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<AdminUser | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
    }
  }, [router]);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/statistics');

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Erreur lors du chargement des statistiques');
      }

      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
    fetchStatistics();
  }, [checkAuth, fetchStatistics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {user && <AdminHeader user={user} />}
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {user && <AdminHeader user={user} />}
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button
              onClick={fetchStatistics}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <AdminHeader user={user} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Vue d&apos;ensemble des demandes de changement de spécialité
          </p>
        </div>

        {/* Cartes de statistiques */}
        <StatsCards stats={statistics.overview} />

        {/* Graphique d'évolution */}
        <RequestsChart
          dataByDay={statistics.charts.byDay}
          dataByWeek={statistics.charts.byWeek}
          dataByMonth={statistics.charts.byMonth}
        />

        {/* Graphiques en grille */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Répartition par statut */}
          <ApprovalRateChart data={statistics.charts.statusDistribution} />

          {/* Info supplémentaire */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Informations clés
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Temps moyen de traitement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.overview.averageProcessingTime} jours
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">Taux d&apos;approbation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.overview.approvalRate}%
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm text-gray-600">Demandes en attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.overview.pending}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-600">Derniers 7 jours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.charts.byDay.slice(-7).reduce((sum, item) => sum + item.demandes, 0)} demandes
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={fetchStatistics}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser les données
              </button>
            </div>
          </div>
        </div>

        {/* Graphique par spécialité */}
        <SpecialtyChart
          dataByCurrentSpecialty={statistics.charts.byCurrentSpecialty}
          dataByDesiredSpecialty={statistics.charts.byDesiredSpecialty}
        />

        {/* Footer du dashboard */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      </main>
    </div>
  );
}
