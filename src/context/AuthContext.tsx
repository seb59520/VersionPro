import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { initializeDatabase } from '../lib/initDb';
import { toast } from 'react-hot-toast';
import { preferencesManager } from '../lib/cache';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth';

interface AuthUser extends User {
  organizationId: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              ...user,
              organizationId: userData.organizationId,
              role: userData.role
            } as AuthUser);

            // Load organization data
            if (userData.organizationId) {
              const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
              if (orgDoc.exists()) {
                const orgData = { id: orgDoc.id, ...orgDoc.data() };
                await preferencesManager.setPreference('currentOrganization', orgData);
              }
            }
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data();
      
      // Load organization data
      if (userData.organizationId) {
        const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
        if (orgDoc.exists()) {
          const orgData = { id: orgDoc.id, ...orgDoc.data() };
          await preferencesManager.setPreference('currentOrganization', orgData);
        }
      }

      setCurrentUser({
        ...user,
        organizationId: userData.organizationId,
        role: userData.role
      } as AuthUser);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      // Clear organization data from cache
      await preferencesManager.deletePreference('currentOrganization');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      await firebaseUpdateProfile(currentUser, data);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await firebaseUpdatePassword(currentUser, newPassword);
      toast.success('Mot de passe mis à jour avec succès');
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    isAdmin: currentUser?.role === 'admin',
    signIn,
    signOut,
    updateProfile,
    updatePassword
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

export default AuthProvider;