
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getDashboardStats } from '../services/mockApi';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
    <p className="text-sm font-medium text-gray-400">{title}</p>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
    <p className="text-xs text-gray-500 mt-2">{description}</p>
  </div>
);

interface MrrData {
  name: string;
  mrr: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<{ subscriptions: number; valuation: number; mrrData: MrrData[] } | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  if (!stats) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Active Subscriptions" 
          value={stats.subscriptions.toLocaleString()} 
          description="+2.5% from last month"
        />
        <StatCard 
          title="Platform Valuation" 
          value={`$${(stats.valuation / 1000000).toFixed(2)}M`}
          description="Based on current MRR"
        />
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Monthly Recurring Revenue (MRR)</h2>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={stats.mrrData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#D1D5DB' }}
                        cursor={{fill: '#374151'}}
                    />
                    <Legend />
                    <Bar dataKey="mrr" fill="#2563EB" name="MRR" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
