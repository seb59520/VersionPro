import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  setPersistence,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, retryOperation, isOnline } from './firebase';
import { toast } from 'react-hot-toast';

export interface UserRole {
  role: 'admin' | 'user';
  permissions: string[];
}

// Enable persistent auth state
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error('Error setting auth persistence:', error);
});

// Helper function to handle Firebase Auth errors
const handleAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Adresse email invalide';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé';
    case 'auth/user-not-found':
      return 'Aucun compte associé à cet email';
    case 'auth/wrong-password':
      return 'Email ou mot de passe incorrect';
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères';
    case 'auth/network-request-failed':
      return 'Erreur de connexion réseau. Vérification de la connexion...';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    case 'auth/operation-not-allowed':
      return 'Cette opération n\'est pas autorisée';
    default:
      return 'Une erreur est survenue lors de l\'authentification';
  }
};

// Get user role
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    
    const data = userDoc.data();
    return {
      role: data.role || 'user',
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

// Create a new user
export const createUser = async (email: string, password: string) => {
  if (!isOnline) {
    throw new Error('Pas de connexion internet');
  }

  try {
    const userCredential = await retryOperation(async () => {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      await setDoc(doc(db, 'users', credential.user.uid), {
        email,
        role: 'user',
        permissions: ['read'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return credential;
    });

    return userCredential.user;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(handleAuthError(error));
  }
};

// Sign in with email/password
export const signIn = async (email: string, password: string) => {
  if (!isOnline) {
    throw new Error('Pas de connexion internet');
  }

  try {
    const userCredential = await retryOperation(() => 
      signInWithEmailAndPassword(auth, email, password)
    );
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(handleAuthError(error));
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(handleAuthError(error));
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  if (!isOnline) {
    throw new Error('Pas de connexion internet');
  }

  try {
    await retryOperation(() => sendPasswordResetEmail(auth, email));
    toast.success('Email de réinitialisation envoyé');
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(handleAuthError(error));
  }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!isOnline) {
    throw new Error('Pas de connexion internet');
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await retryOperation(async () => {
      const credential = await signInWithPopup(auth, provider);
      
      // Create or update user document
      const userRef = doc(db, 'users', credential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: credential.user.email,
          role: 'user',
          permissions: ['read'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      return credential;
    });

    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(handleAuthError(error));
  }
};