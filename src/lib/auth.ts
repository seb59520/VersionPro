import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { initializeDatabase } from './initDb';
import { toast } from 'react-hot-toast';

export interface UserRole {
  role: 'admin' | 'user';
  permissions: string[];
}

// Enable persistent auth state
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting persistence:', error);
});

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
    console.error('Error creating user:', error);
    throw error;
  }
};

// Sign in with email/password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Handle Google sign-in
const handleGoogleUser = async (user: User) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'user',
        createdAt: serverTimestamp(),
        permissions: ['read'],
        displayName: user.displayName,
        photoURL: user.photoURL
      });

      await initializeDatabase(user.uid, user.email || '');
    }

    return user;
  } catch (error) {
    console.error('Error handling Google user:', error);
    throw error;
  }
};

// Sign in with Google using popup
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await handleGoogleUser(result.user);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      toast.error('Le navigateur a bloqué la fenêtre de connexion. Veuillez autoriser les popups.');
    } else if (error.code === 'auth/unauthorized-domain') {
      toast.error('Ce domaine n\'est pas autorisé pour la connexion Google.');
    } else {
      toast.error('Erreur lors de la connexion avec Google');
    }
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error resetting password:', error);
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
  } catch (error: any) {
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