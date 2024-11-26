import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { toast } from 'react-hot-toast';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase services
let app;
let db;
let auth;
let storage;
let analytics;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);

  // Initialize Firestore with simpler persistence settings
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
  });

  // Initialize Auth with persistence
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(console.error);

  // Initialize Storage
  storage = getStorage(app);

  // Initialize Analytics only in production
  if (import.meta.env.PROD) {
    analytics = getAnalytics(app);
  }

  // Enable offline persistence with error handling
  const setupPersistence = async () => {
    try {
      await enableIndexedDbPersistence(db);
      console.log('Offline persistence enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence enabled in first tab only');
      } else if (err.code === 'unimplemented') {
        console.warn('Browser doesn\'t support persistence');
      } else {
        console.error('Persistence error:', err);
      }
    }
  };

  // Setup persistence in background
  setupPersistence().catch(console.error);

  // Connect to auth emulator in development
  if (import.meta.env.DEV && import.meta.env.VITE_AUTH_EMULATOR_HOST) {
    connectAuthEmulator(auth, `http://${import.meta.env.VITE_AUTH_EMULATOR_HOST}`);
  }

} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Fallback initialization without persistence
  try {
    if (!app) app = initializeApp(firebaseConfig);
    if (!db) db = getFirestore(app);
    if (!auth) auth = getAuth(app);
    if (!storage) storage = getStorage(app);
    
    console.log('Firebase initialized with fallback configuration');
  } catch (fallbackError) {
    console.error('Critical Firebase initialization error:', fallbackError);
    toast.error('Erreur critique de l\'application');
  }
}

// Network status monitoring
let isOnline = navigator.onLine;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Retry mechanism for failed operations
const retryOperation = async (operation: () => Promise<any>) => {
  let lastError;
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (error.code === 'auth/network-request-failed') {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

// Network status listener
const networkStatusListener = () => {
  const wasOnline = isOnline;
  isOnline = navigator.onLine;
  
  if (wasOnline && !isOnline) {
    toast.warning('Connexion internet perdue. Mode hors-ligne activé.');
  } else if (!wasOnline && isOnline) {
    toast.success('Connexion internet rétablie.');
    retryCount = 0;
  }
};

// Add network status listeners
window.addEventListener('online', networkStatusListener);
window.addEventListener('offline', networkStatusListener);

// Export initialized services and utilities
export { db, auth, storage, analytics, isOnline, retryOperation };