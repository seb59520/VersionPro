import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthGuard from './components/AuthGuard';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import GeneralSettings from './components/settings/GeneralSettings';
import PosterSettings from './components/settings/PosterSettings';
import PublicationSettings from './components/settings/PublicationSettings';
import StandSettings from './components/settings/StandSettings';
import MaintenanceSettings from './components/settings/MaintenanceSettings';
import NotificationSettings from './components/settings/NotificationSettings';
import UserProfileSettings from './components/settings/UserProfileSettings';
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
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/stand/:id" element={<PublicStandView />} />
          
          {/* Routes protégées */}
          <Route element={<AuthGuard><Layout /></AuthGuard>}>
            <Route index element={<Dashboard />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="maintenance" element={<MaintenanceDashboard />} />
            
            {/* Routes des paramètres */}
            <Route path="settings" element={<GeneralSettings />} />
            <Route path="settings/stands" element={<StandSettings />} />
            <Route path="settings/posters" element={<PosterSettings />} />
            <Route path="settings/publications" element={<PublicationSettings />} />
            <Route path="settings/maintenance" element={<MaintenanceSettings />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />
            <Route path="settings/profile" element={<UserProfileSettings />} />
            
            <Route path="details/:type" element={<StandDetails />} />
            <Route path="admin/stand/:id" element={<StandDetailPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;