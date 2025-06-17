import React from 'react';
import { BarChart3, Clock, Users, Star, Mic } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Interviews"
          value="124"
          icon={<Mic className="w-6 h-6" />}
          trend="+12%"
        />
        <StatCard
          title="Average Score"
          value="85%"
          icon={<Star className="w-6 h-6" />}
          trend="+5%"
        />
        <StatCard
          title="Total Time"
          value="48h"
          icon={<Clock className="w-6 h-6" />}
          trend="+2h"
        />
        <StatCard
          title="Active Users"
          value="45"
          icon={<Users className="w-6 h-6" />}
          trend="+8"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
          <BarChart3 className="w-full h-64 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">{icon}</div>
        <span className="text-green-400">{trend}</span>
      </div>
      <h3 className="text-slate-400 text-sm">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
};

export default Dashboard;