import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeDatabase } from '../lib/initDb';
import { toast } from 'react-hot-toast';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            await initializeDatabase(user.uid, user.email || '');
          }
        } catch (error) {
          console.error('Error checking user document:', error);
          toast.error('Erreur lors de la vérification du compte');
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(user);
      return user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      let message = 'Erreur lors de la connexion';
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
          message = 'Mot de passe incorrect';
          break;
      }
      toast.error(message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await initializeDatabase(user.uid, email);
      setCurrentUser(user);
      return user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      let message = 'Erreur lors de la création du compte';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/invalid-email':
          message = 'Adresse email invalide';
          break;
        case 'auth/operation-not-allowed':
          message = 'La création de compte est désactivée';
          break;
        case 'auth/weak-password':
          message = 'Le mot de passe est trop faible';
          break;
      }
      toast.error(message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Vérifier si l'utilisateur existe déjà dans Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      // Si l'utilisateur n'existe pas, créer son profil
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'user',
          createdAt: new Date().toISOString(),
          permissions: ['read'],
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      }

      setCurrentUser(user);
      return user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error('Erreur lors de la connexion avec Google');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Erreur lors de la déconnexion');
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signOut,
    signUp,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};