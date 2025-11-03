'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ApprovalRateChartProps {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}

export default function ApprovalRateChart({ data }: ApprovalRateChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Répartition par statut</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name}: ${entry.value} (${total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <p className="text-sm font-medium text-gray-700">{item.name}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: item.fill }}>
              {item.value}
            </p>
            <p className="text-xs text-gray-500">
              {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
