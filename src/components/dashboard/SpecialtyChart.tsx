'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';

interface SpecialtyChartProps {
  dataByCurrentSpecialty: Array<{ name: string; value: number }>;
  dataByDesiredSpecialty: Array<{ name: string; value: number }>;
}

type SpecialtyView = 'current' | 'desired';

export default function SpecialtyChart({ dataByCurrentSpecialty, dataByDesiredSpecialty }: SpecialtyChartProps) {
  const [view, setView] = useState<SpecialtyView>('desired');

  const chartData = view === 'current' ? dataByCurrentSpecialty : dataByDesiredSpecialty;

  // Limiter aux 10 premières spécialités
  const topSpecialties = chartData.slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Demandes par spécialité</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setView('current')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'current'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Spécialité actuelle
          </button>
          <button
            onClick={() => setView('desired')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'desired'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Spécialité souhaitée
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={topSpecialties}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            width={150}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="value" 
            fill="#3b82f6"
            radius={[0, 4, 4, 0]}
            name="Nombre de demandes"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          {view === 'current' 
            ? '📊 Top 10 des spécialités actuelles des étudiants'
            : '📊 Top 10 des spécialités les plus demandées'
          }
        </p>
      </div>
    </div>
  );
}
