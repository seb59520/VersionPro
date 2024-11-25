import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { initializeDatabase } from './initDb';
import { toast } from 'react-hot-toast';

export interface UserRole {
  role: 'admin' | 'user';
  permissions: string[];
}

// Enable persistent auth state
setPersistence(auth, browserLocalPersistence);

// Create a new user
export const createUser = async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      role,
      createdAt: serverTimestamp(),
      permissions: role === 'admin' ? ['all'] : ['read'],
    });

    await initializeDatabase(userCredential.user.uid, email);
    return userCredential.user;
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
};

// Sign in with email/password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success('Email de réinitialisation envoyé');
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
};

// Get user role
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    
    const data = userDoc.data();
    return {
      role: data.role,
      permissions: data.permissions || []
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Check if user is admin
export const isAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  const role = await getUserRole(user.uid);
  return role?.role === 'admin';
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Handle authentication errors
const handleAuthError = (error: any) => {
  let message = 'Une erreur est survenue';
  
  switch (error.code) {
    case 'auth/invalid-email':
      message = 'Adresse email invalide';
      break;
    case 'auth/user-disabled':
      message = 'Ce compte a été désactivé';
      break;
    case 'auth/user-not-found':
      message = 'Aucun compte associé à cet email';
      break;
    case 'auth/wrong-password':
      message = 'Email ou mot de passe incorrect';
      break;
    case 'auth/email-already-in-use':
      message = 'Cette adresse email est déjà utilisée';
      break;
    case 'auth/weak-password':
      message = 'Le mot de passe doit contenir au moins 6 caractères';
      break;
    case 'auth/too-many-requests':
      message = 'Trop de tentatives. Veuillez réessayer plus tard.';
      break;
  }

  toast.error(message);
};