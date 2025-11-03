'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';

interface RequestsChartProps {
  dataByDay: Array<{ date: string; demandes: number }>;
  dataByWeek: Array<{ week: string; demandes: number }>;
  dataByMonth: Array<{ month: string; demandes: number }>;
}

type TimeFilter = 'day' | 'week' | 'month';

export default function RequestsChart({ dataByDay, dataByWeek, dataByMonth }: RequestsChartProps) {
  const [filter, setFilter] = useState<TimeFilter>('day');

  const chartData = 
    filter === 'day' ? dataByDay :
    filter === 'week' ? dataByWeek :
    dataByMonth;

  const xKey = filter === 'day' ? 'date' : filter === 'week' ? 'week' : 'month';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Évolution des demandes</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('day')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par jour
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par semaine
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par mois
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={xKey} 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={filter === 'day' ? -45 : 0}
            textAnchor={filter === 'day' ? 'end' : 'middle'}
            height={filter === 'day' ? 80 : 60}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey="demandes" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Demandes"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          {filter === 'day' && '📊 Affichage des 30 derniers jours'}
          {filter === 'week' && '📊 Affichage des 12 dernières semaines'}
          {filter === 'month' && '📊 Affichage des 6 derniers mois'}
        </p>
      </div>
    </div>
  );
}
