import React from 'react';
import { Bell, Settings, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-100">AI Voice Interviewer</h1>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-slate-700 rounded-lg">
            <Bell className="w-5 h-5 text-slate-300" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg">
            <Settings className="w-5 h-5 text-slate-300" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg">
            <User className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;