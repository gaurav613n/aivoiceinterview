import React, { useState } from 'react';
import { useInterviewStore } from '../store/interviewStore';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOPICS = [
  'JavaScript',
  'React',
  'Python',
  'Java',
  'General Programming',
  'Frontend Development',
  'Backend Development',
  'Database',
  'System Design',
];

const Settings: React.FC = () => {
  const { settings, setSettings } = useInterviewStore();
  const [topic, setTopic] = useState(settings.topic);
  const navigate = useNavigate();

  const handleSave = () => {
    setSettings({ topic });
    navigate('/interview');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Interview Settings</h1>
          <p className="mt-2 text-gray-400">Choose your interview topic</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <label className="block mb-4 text-lg font-medium">
            Select Topic
          </label>
          
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            className="mt-6 w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Start Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;