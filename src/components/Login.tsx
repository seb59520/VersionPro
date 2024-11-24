import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { Lock, Mail, AlertCircle, Building2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getOrganizationByDomain } from '../lib/organization';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { signIn } = useAuth();
  const { currentOrganization, setCurrentOrganization } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        // Get organization based on current domain
        const domain = window.location.hostname;
        const org = await getOrganizationByDomain(domain);
        if (org) {
          setCurrentOrganization(org);
        }
      } catch (error) {
        console.error('Error loading organization:', error);
      }
    };

    if (!currentOrganization) {
      loadOrganization();
    }
  }, [currentOrganization, setCurrentOrganization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Connexion réussie');
      navigate(from, { replace: true });
    } catch (error: any) {
      let message = 'Erreur de connexion';
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
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Veuillez saisir votre adresse email');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      toast.success('Instructions envoyées par email');
    } catch (error: any) {
      let message = 'Erreur lors de l\'envoi';
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Adresse email invalide';
          break;
        case 'auth/user-not-found':
          message = 'Aucun compte associé à cet email';
          break;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 shadow-xl border-2 border-blue-100">
          {/* Organization Header */}
          {currentOrganization ? (
            <div className="text-center mb-8">
              {currentOrganization.logo ? (
                <img 
                  src={currentOrganization.logo} 
                  alt={currentOrganization.name}
                  className="h-16 mx-auto mb-4"
                />
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                    <Building2 className="h-8 w-8" />
                  </div>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {currentOrganization.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Accédez à l'espace de gestion des présentoirs
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {currentOrganization.domain}
              </div>
            </div>
          ) : (
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <Lock className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Connexion
              </h1>
              <p className="text-gray-600 mt-2">
                Accédez à votre espace de gestion des présentoirs
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!showResetPassword ? (
            <>
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
                  style={{
                    background: currentOrganization?.theme?.primaryColor 
                      ? `linear-gradient(to right, ${currentOrganization.theme.primaryColor}, ${currentOrganization.theme.secondaryColor || currentOrganization.theme.primaryColor})`
                      : undefined
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Connexion en cours...
                    </div>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {resetSent ? (
                <div className="text-center">
                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700">
                      Les instructions de réinitialisation ont été envoyées à votre adresse email.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetSent(false);
                      setResetEmail('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Réinitialisation du mot de passe
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Entrez votre adresse email pour recevoir les instructions de réinitialisation.
                  </p>
                  
                  <div className="mb-6">
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
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(false)}
                      className="text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Envoi...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          Envoyer les instructions
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;