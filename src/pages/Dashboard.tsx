import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Clock, Users, Star, Mic, Play } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-slate-800 rounded-lg p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      </div>
      <div className="p-2 bg-slate-700/50 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <span className="text-sm text-emerald-400">{trend}</span>
      <span className="text-sm text-slate-400 ml-1">vs last month</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section with Start Interview Button */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 mb-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to AI Interview Assistant</h1>
          <p className="text-blue-100 mb-6">
            Start your technical interview with our AI-powered interviewer. Get real-time feedback,
            comprehensive analysis, and improve your interview skills.
          </p>
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-lg"
          >
            <Play className="w-5 h-5" />
            Start New Interview
          </button>
        </div>
      </div>

      {/* Stats Section */}
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
          <div className="text-center py-8 text-slate-400">
            <p>Start your first interview to see your history here.</p>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
          <div className="flex items-center justify-center h-64">
            <BarChart3 className="w-full h-full text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;