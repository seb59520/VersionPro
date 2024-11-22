import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthGuard from './components/AuthGuard';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import PublicStandView from './components/PublicStandView';
import StandDetails from './components/StandDetails';
import MaintenanceDashboard from './components/MaintenanceDashboard';
import StandDetailPage from './components/StandDetailPage';
import Unauthorized from './components/Unauthorized';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/stand/:id" element={<PublicStandView />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Routes protégées */}
          <Route path="/" element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="maintenance" element={<MaintenanceDashboard />} />
            <Route path="settings" element={
              <AuthGuard requireAdmin>
                <Settings />
              </AuthGuard>
            } />
            <Route path="details/:type" element={<StandDetails />} />
            <Route path="stand/:id" element={<StandDetailPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;