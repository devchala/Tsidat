import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, Clock, CheckCircle, AlertTriangle, Users, UserPlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const mockChartData = [
  { name: 'Mon', reports: 12 },
  { name: 'Tue', reports: 19 },
  { name: 'Wed', reports: 15 },
  { name: 'Thu', reports: 22 },
  { name: 'Fri', reports: 28 },
  { name: 'Sat', reports: 14 },
  { name: 'Sun', reports: 9 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const kpis = [
    { title: 'Total Reports', value: stats.totalReports, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', link: '/reports' },
    { title: 'Pending Reports', value: stats.pendingReports, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', link: '/reports?status=pending' },
    { title: 'In Progress', value: stats.inProgress, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', link: '/reports?status=inprogress' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', link: '/reports?status=completed' },
    { title: 'Active Workers', value: stats.activeWorkers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', link: '/workers' },
    { title: 'Pending Approvals', value: stats.pendingWorkerApprovals, icon: UserPlus, color: 'text-red-600', bg: 'bg-red-100', link: '/workers?status=pending' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi, index) => (
          <div 
            key={index} 
            onClick={() => navigate(kpi.link)}
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-md p-3 ${kpi.bg}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{kpi.title}</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{kpi.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Reports Over Time (This Week)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="reports" stroke="#16a34a" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
