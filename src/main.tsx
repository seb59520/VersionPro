import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import { StandsProvider } from './context/StandsContext';
import { SettingsProvider } from './context/SettingsContext';
import './lib/firebase';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <OrganizationProvider>
        <SettingsProvider>
          <StandsProvider>
            <App />
          </StandsProvider>
        </SettingsProvider>
      </OrganizationProvider>
    </AuthProvider>
  </StrictMode>
);