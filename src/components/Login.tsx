import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import OrganizationSelector from './OrganizationSelector';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const checkUserOrganization = async (userId: string) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data().organizationId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        user = await signUp(email, password);
        setShowOrgSelector(true);
      } else {
        user = await signIn(email, password);
        const hasOrg = await checkUserOrganization(user.uid);
        if (!hasOrg) {
          setShowOrgSelector(true);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      let message = 'Erreur lors de l\'opération';
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
        case 'auth/email-already-in-use':
          message = 'Cette adresse email est déjà utilisée';
          break;
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogle();
      const hasOrg = await checkUserOrganization(user.uid);
      
      if (!hasOrg) {
        setShowOrgSelector(true);
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error('Erreur lors de la connexion avec Google');
    } finally {
      setLoading(false);
    }
  };

  if (showOrgSelector) {
    return (
      <OrganizationSelector 
        onComplete={() => {
          navigate(from, { replace: true });
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 shadow-xl border-2 border-blue-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Lock className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Créer un compte' : 'Connexion'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'Créez votre compte pour commencer' : 'Accédez à votre espace'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isSignUp ? 'Création en cours...' : 'Connexion en cours...'}
                </div>
              ) : (
                isSignUp ? 'Créer un compte' : 'Se connecter'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
            >
              <FcGoogle className="h-5 w-5" />
              Google
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? 'Déjà un compte ? Se connecter' : 'Créer un compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;