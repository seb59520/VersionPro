import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  domain: string;
}

interface OrganizationSelectorProps {
  onComplete: () => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    domain: ''
  });

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgQuery = query(collection(db, 'organizations'));
        const snapshot = await getDocs(orgQuery);
        const orgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Organization[];
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error loading organizations:', error);
        toast.error('Erreur lors du chargement des organisations');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleJoinOrganization = async () => {
    if (!selectedOrg || !currentUser) return;

    try {
      setLoading(true);
      // Update user document with selected organization
      await setDoc(doc(db, 'users', currentUser.uid), {
        organizationId: selectedOrg,
        email: currentUser.email,
        role: 'user',
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast.success('Organisation rejointe avec succès');
      onComplete();
    } catch (error) {
      console.error('Error joining organization:', error);
      toast.error('Erreur lors de la connexion à l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);

      // Create new organization
      const orgRef = doc(collection(db, 'organizations'));
      await setDoc(orgRef, {
        name: newOrg.name,
        domain: newOrg.domain,
        createdAt: new Date().toISOString(),
        settings: {
          baseUrl: `${window.location.origin}/stand/`,
          maxReservationDays: 30,
          minAdvanceHours: 24,
          emailNotifications: {
            newReservation: true,
            posterRequest: true,
            maintenance: true
          },
          maintenance: {
            preventiveIntervalMonths: 3,
            emailNotifications: true
          }
        }
      });

      // Update user as admin of new organization
      await setDoc(doc(db, 'users', currentUser.uid), {
        organizationId: orgRef.id,
        email: currentUser.email,
        role: 'admin',
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast.success('Organisation créée avec succès');
      onComplete();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Erreur lors de la création de l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Building2 className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {showCreateForm ? 'Créer une organisation' : 'Rejoindre une organisation'}
            </h1>
            <p className="text-gray-600 mt-2">
              {showCreateForm 
                ? 'Créez votre propre organisation'
                : 'Sélectionnez une organisation existante ou créez-en une nouvelle'}
            </p>
          </div>

          {showCreateForm ? (
            <form onSubmit={handleCreateOrganization} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'organisation
                </label>
                <input
                  type="text"
                  required
                  className="input bg-white"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domaine
                </label>
                <input
                  type="text"
                  required
                  className="input bg-white"
                  value={newOrg.domain}
                  onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                  placeholder="exemple.com"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Création en cours...
                    </div>
                  ) : (
                    'Créer l\'organisation'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Retour
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionner une organisation
                </label>
                <select
                  className="input bg-white"
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  required
                >
                  <option value="">Choisir une organisation</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleJoinOrganization}
                  disabled={!selectedOrg || loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connexion en cours...
                    </div>
                  ) : (
                    'Rejoindre l\'organisation'
                  )}
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une nouvelle organisation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSelector;