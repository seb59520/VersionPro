import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeDatabase } from '../lib/initDb';
import { toast } from 'react-hot-toast';
import * as authService from '../lib/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges(async (user) => {
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

  const value = {
    currentUser,
    loading,
    signIn: authService.signIn,
    signOut: authService.signOut,
    signUp: authService.createUser,
    signInWithGoogle: authService.signInWithGoogle,
    updateProfile: async (data: { displayName?: string; photoURL?: string }) => {
      if (!currentUser) throw new Error('No user logged in');
      await auth.currentUser?.updateProfile(data);
      setCurrentUser(auth.currentUser);
    },
    updatePassword: async (currentPassword: string, newPassword: string) => {
      if (!currentUser) throw new Error('No user logged in');
      await authService.signIn(currentUser.email!, currentPassword);
      await auth.currentUser?.updatePassword(newPassword);
    }
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