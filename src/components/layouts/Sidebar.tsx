import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Mic, FileText, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-slate-700">
          <span className="text-xl font-bold text-slate-100">AI Interviewer</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
          
          <NavLink
            to="/interview"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <Mic className="w-5 h-5 mr-3" />
            Interview
          </NavLink>
          
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <FileText className="w-5 h-5 mr-3" />
            Reports
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;