
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Suppliers from './views/Suppliers';
import Clients from './views/Clients';
import Transactions from './views/Transactions';
import Reports from './views/Reports';
import Audit from './views/Audit';
import Login from './views/Login';
import { authService } from './services/auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/suppliers" element={
          <ProtectedRoute>
            <Layout><Suppliers /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/clients" element={
          <ProtectedRoute>
            <Layout><Clients /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Layout><Transactions /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/audit" element={
          <ProtectedRoute>
            <Layout><Audit /></Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
