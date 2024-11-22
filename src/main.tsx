import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { StandsProvider } from './context/StandsContext';
import './lib/firebase'; // Initialize Firebase first

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <StandsProvider>
          <App />
        </StandsProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>
);