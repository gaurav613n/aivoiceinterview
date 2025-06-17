import React from 'react';
import { Download } from 'lucide-react';

const Reports: React.FC = () => {
  const reports = [
    {
      id: 1,
      title: 'Technical Interview - Senior Developer',
      date: '2024-06-15',
      score: 85,
      duration: '45 min',
    },
    {
      id: 2,
      title: 'HR Interview - Culture Fit',
      date: '2024-06-14',
      score: 92,
      duration: '30 min',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Interview Reports</h2>
          <button className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </button>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-700 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-slate-400">Date: {report.date}</p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-sm text-slate-400">Score</p>
                  <p className="font-semibold text-green-400">{report.score}%</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-400">Duration</p>
                  <p className="font-semibold">{report.duration}</p>
                </div>
                
                <button className="p-2 hover:bg-slate-600 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;