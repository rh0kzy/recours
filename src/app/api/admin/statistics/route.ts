import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Récupérer toutes les demandes
    const { data: requests, error } = await supabase
      .from('specialty_change_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      // Si la table n'existe pas, retourner des données vides
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('Table specialty_change_requests does not exist yet. Returning empty statistics.');
        return NextResponse.json({
          overview: {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            approvalRate: 0,
            last30Days: 0,
            last7Days: 0,
            averageProcessingTime: 0,
          },
          charts: {
            byDay: [],
            byWeek: [],
            byMonth: [],
            byCurrentSpecialty: [],
            byDesiredSpecialty: [],
            statusDistribution: [
              { name: 'En attente', value: 0, fill: '#fbbf24' },
              { name: 'Approuvé', value: 0, fill: '#10b981' },
              { name: 'Rejeté', value: 0, fill: '#ef4444' },
            ],
          },
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch requests', details: error.message },
        { status: 500 }
      );
    }

    // S'assurer que requests n'est pas null
    const requestsList = requests || [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Statistiques générales
    const totalRequests = requestsList.length;
    const pendingRequests = requestsList.filter(r => r.status === 'pending').length;
    const approvedRequests = requestsList.filter(r => r.status === 'approved').length;
    const rejectedRequests = requestsList.filter(r => r.status === 'rejected').length;

    const approvalRate = totalRequests > 0 
      ? parseFloat(((approvedRequests / (approvedRequests + rejectedRequests)) * 100).toFixed(1))
      : 0;

    // Statistiques par période
    const requestsLast30Days = requestsList.filter(
      r => new Date(r.created_at) >= thirtyDaysAgo
    ).length;

    const requestsLast7Days = requestsList.filter(
      r => new Date(r.created_at) >= sevenDaysAgo
    ).length;

    // Demandes par jour (30 derniers jours)
    const requestsByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      requestsByDay[dateStr] = 0;
    }

    requestsList.forEach(request => {
      const dateStr = request.created_at.split('T')[0];
      if (requestsByDay.hasOwnProperty(dateStr)) {
        requestsByDay[dateStr]++;
      }
    });

    // Demandes par semaine (12 dernières semaines)
    const requestsByWeek: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const weekNum = `Semaine ${12 - i}`;
      requestsByWeek[weekNum] = 0;
    }

    // Compter les demandes par semaine
    requestsList.forEach(request => {
      const requestDate = new Date(request.created_at);
      const weeksDiff = Math.floor((now.getTime() - requestDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeksDiff >= 0 && weeksDiff < 12) {
        const weekNum = `Semaine ${12 - weeksDiff}`;
        requestsByWeek[weekNum]++;
      }
    });

    // Demandes par mois (6 derniers mois)
    const requestsByMonth: Record<string, number> = {};
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
      requestsByMonth[monthKey] = 0;
    }

    requestsList.forEach(request => {
      const requestDate = new Date(request.created_at);
      const monthKey = `${monthNames[requestDate.getMonth()]} ${requestDate.getFullYear()}`;
      if (requestsByMonth.hasOwnProperty(monthKey)) {
        requestsByMonth[monthKey]++;
      }
    });

    // Demandes par spécialité (actuelle et souhaitée)
    const requestsByCurrentSpecialty: Record<string, number> = {};
    const requestsByDesiredSpecialty: Record<string, number> = {};

    requestsList.forEach(request => {
      // Spécialité actuelle
      if (request.specialite_actuelle) {
        requestsByCurrentSpecialty[request.specialite_actuelle] = 
          (requestsByCurrentSpecialty[request.specialite_actuelle] || 0) + 1;
      }
      
      // Spécialité souhaitée
      if (request.specialite_souhaitee) {
        requestsByDesiredSpecialty[request.specialite_souhaitee] = 
          (requestsByDesiredSpecialty[request.specialite_souhaitee] || 0) + 1;
      }
    });

    // Temps moyen de traitement (en jours)
    const processedRequests = requestsList.filter(
      r => r.status !== 'pending' && r.updated_at
    );

    let averageProcessingTime = 0;
    if (processedRequests.length > 0) {
      const totalProcessingTime = processedRequests.reduce((sum, request) => {
        const created = new Date(request.created_at).getTime();
        const updated = new Date(request.updated_at!).getTime();
        const days = (updated - created) / (24 * 60 * 60 * 1000);
        return sum + days;
      }, 0);
      
      averageProcessingTime = totalProcessingTime / processedRequests.length;
    }

    // Répartition par statut
    const statusDistribution = {
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
    };

    return NextResponse.json({
      overview: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        approvalRate: approvalRate,
        last30Days: requestsLast30Days,
        last7Days: requestsLast7Days,
        averageProcessingTime: parseFloat(averageProcessingTime.toFixed(1)),
      },
      charts: {
        byDay: Object.entries(requestsByDay).map(([date, count]) => ({
          date,
          demandes: count,
        })),
        byWeek: Object.entries(requestsByWeek).map(([week, count]) => ({
          week,
          demandes: count,
        })),
        byMonth: Object.entries(requestsByMonth).map(([month, count]) => ({
          month,
          demandes: count,
        })),
        byCurrentSpecialty: Object.entries(requestsByCurrentSpecialty)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        byDesiredSpecialty: Object.entries(requestsByDesiredSpecialty)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({
          name: name === 'pending' ? 'En attente' : name === 'approved' ? 'Approuvé' : 'Rejeté',
          value,
          fill: name === 'pending' ? '#fbbf24' : name === 'approved' ? '#10b981' : '#ef4444',
        })),
      },
    });
  } catch (error) {
    console.error('Error generating statistics:', error);
    return NextResponse.json(
      { error: 'Failed to generate statistics' },
      { status: 500 }
    );
  }
}
