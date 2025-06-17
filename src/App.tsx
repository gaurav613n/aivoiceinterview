import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Login from './pages/Login';
import Register from './pages/Register';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;