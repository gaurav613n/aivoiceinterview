import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interviewStore';
import { Download, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckSquare, Square, Play } from 'lucide-react';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, deleteSessions, exportSession } = useInterviewStore();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportingSession, setExportingSession] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleSelectAll = () => {
    if (selectedSessions.length === sessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.map(s => s.id));
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSingleDelete = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        setIsDeleting(true);
        await deleteSessions([sessionId]);
        if (expandedSession === sessionId) {
          setExpandedSession(null);
        }
        setSelectedSessions(prev => prev.filter(id => id !== sessionId));
      } catch (err) {
        showError('Failed to delete session');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSessions.length === 0) {
      showError('Please select sessions to delete');
      return;
    }

    const message = selectedSessions.length === sessions.length
      ? 'Are you sure you want to delete ALL interview sessions? This cannot be undone.'
      : `Are you sure you want to delete ${selectedSessions.length} selected session${selectedSessions.length > 1 ? 's' : ''}?`;

    if (confirm(message)) {
      try {
        setIsDeleting(true);
        await deleteSessions(selectedSessions);
        setSelectedSessions([]);
        setExpandedSession(null);
      } catch (err) {
        showError('Failed to delete sessions');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleExport = async (sessionId: string) => {
    try {
      setExportingSession(sessionId);
      const blob = await exportSession(sessionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `interview-session-${timestamp}.json`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showError('Failed to export session');
    } finally {
      setExportingSession(null);
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSession(prev => prev === sessionId ? null : sessionId);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Interview Reports</h1>
          {sessions.length > 0 && (
            <>
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {selectedSessions.length === sessions.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedSessions.length === sessions.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => navigate('/interview')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Start New Interview
              </button>
            </>
          )}
        </div>
        
        {selectedSessions.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Delete Selected ({selectedSessions.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Empty State */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-900 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">No Interview Sessions</h2>
          <p className="text-gray-400 mb-6">Start your first interview to begin.</p>
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Interview
          </button>
        </div>
      ) : (
        /* Session List */
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              {/* Session Header */}
              <div className="flex items-center p-4">
                <input
                  type="checkbox"
                  checked={selectedSessions.includes(session.id)}
                  onChange={() => handleSessionSelect(session.id)}
                  className="mr-4"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleSession(session.id)}
                    >
                      <h3 className="text-lg font-medium text-white">
                        {session.settings.topic}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">
                        {formatDate(session.timestamp)}
                      </span>
                      <button
                        onClick={() => handleExport(session.id)}
                        disabled={exportingSession === session.id}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Export session"
                      >
                        <Download className={`w-5 h-5 ${exportingSession === session.id ? 'text-primary-500 animate-pulse' : 'text-gray-400'}`} />
                      </button>
                      <button
                        onClick={() => handleSingleDelete(session.id)}
                        disabled={isDeleting}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete session"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                      </button>
                      <button
                        onClick={() => toggleSession(session.id)}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        {expandedSession === session.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              {expandedSession === session.id && (
                <div className="p-4 border-t border-gray-700">
                  <div className="space-y-4">
                    {/* Messages */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Interview Transcript</h4>
                      <div className="space-y-2">
                        {session.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-blue-600/20 text-white'
                                : 'bg-gray-700 text-white'
                            }`}
                          >
                            <div className="text-sm font-medium mb-1 text-gray-400">
                              {message.sender === 'user' ? 'You' : 'Interviewer'}
                            </div>
                            <p className="text-sm">{message.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Analysis */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Analysis</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-1">
                            Feedback
                          </h5>
                          <ul className="list-disc list-inside text-sm text-white space-y-1">
                            {session.analysis?.feedback.map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-1">
                            Areas for Improvement
                          </h5>
                          <ul className="list-disc list-inside text-sm text-white space-y-1">
                            {session.analysis?.improvements.map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;