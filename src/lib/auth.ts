import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserRole {
  role: 'admin' | 'user';
  permissions: string[];
}

// Créer un nouvel utilisateur
export const createUser = async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Créer le profil utilisateur dans Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    role,
    createdAt: new Date().toISOString(),
    permissions: role === 'admin' ? ['all'] : ['read'],
  });

  return userCredential.user;
};

// Connexion utilisateur avec email/mot de passe
export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Connexion avec Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  
  // Vérifier si l'utilisateur existe déjà dans Firestore
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  
  // Si l'utilisateur n'existe pas, créer son profil
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      role: 'user',
      createdAt: new Date().toISOString(),
      permissions: ['read'],
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL
    });
  }

  return userCredential.user;
};

// Déconnexion
export const logout = () => signOut(auth);

// Réinitialisation du mot de passe
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

// Obtenir le rôle de l'utilisateur
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  
  const data = userDoc.data();
  return {
    role: data.role,
    permissions: data.permissions || []
  };
};

// Vérifier si l'utilisateur est admin
export const isAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  const role = await getUserRole(user.uid);
  return role?.role === 'admin';
};

// Observer les changements d'état d'authentification
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};