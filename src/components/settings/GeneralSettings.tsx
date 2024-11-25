import React, { useState } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { Building2, Mail, Phone, MapPin, Link, Clock, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const GeneralSettings = () => {
  const { currentOrganization, setCurrentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentOrganization?.name || '',
    domain: currentOrganization?.domain || '',
    address: currentOrganization?.address || '',
    city: currentOrganization?.city || '',
    postalCode: currentOrganization?.postalCode || '',
    country: currentOrganization?.country || '',
    phone: currentOrganization?.phone || '',
    email: currentOrganization?.email || '',
    settings: {
      baseUrl: currentOrganization?.settings?.baseUrl || `${window.location.origin}/stand/`,
      maxReservationDays: currentOrganization?.settings?.maxReservationDays || 30,
      minAdvanceHours: currentOrganization?.settings?.minAdvanceHours || 24,
      maintenance: {
        preventiveIntervalMonths: currentOrganization?.settings?.maintenance?.preventiveIntervalMonths || 3
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      const orgRef = doc(db, 'organizations', currentOrganization.id);
      
      const updatedData = {
        ...formData,
        settings: {
          ...currentOrganization.settings,
          ...formData.settings,
          maintenance: {
            ...currentOrganization.settings.maintenance,
            ...formData.settings.maintenance
          }
        },
        updatedAt: new Date().toISOString()
      };

      await updateDoc(orgRef, updatedData);

      setCurrentOrganization({
        ...currentOrganization,
        ...updatedData
      });

      toast.success('Organisation mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Informations de l'organisation */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Paramètres de l'Organisation
            </h2>
            <p className="text-gray-600 text-sm">
              Gérez les informations de votre organisation
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'organisation *
              </label>
              <input
                type="text"
                className="input bg-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domaine
              </label>
              <input
                type="text"
                className="input bg-white"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="input pl-10 bg-white"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  className="input pl-10 bg-white"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  className="input bg-white"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  className="input bg-white"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  className="input bg-white"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  className="input bg-white"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Paramètres système */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">URL de base</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de base pour les présentoirs
              </label>
              <input
                type="url"
                className="input bg-white"
                value={formData.settings.baseUrl}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    baseUrl: e.target.value
                  }
                })}
                placeholder="https://example.com/stand/"
              />
              <p className="mt-1 text-sm text-gray-500">
                Cette URL sera utilisée pour générer les liens vers les présentoirs
              </p>
            </div>
          </div>

          {/* Paramètres de réservation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Paramètres de réservation</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée maximale de réservation (jours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="input bg-white"
                  value={formData.settings.maxReservationDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      maxReservationDays: parseInt(e.target.value)
                    }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Délai minimum avant réservation (heures)
                </label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  className="input bg-white"
                  value={formData.settings.minAdvanceHours}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      minAdvanceHours: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Paramètres de maintenance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Paramètres de maintenance</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalle de maintenance préventive (mois)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                className="input bg-white w-32"
                value={formData.settings.maintenance.preventiveIntervalMonths}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    maintenance: {
                      ...formData.settings.maintenance,
                      preventiveIntervalMonths: parseInt(e.target.value)
                    }
                  }
                })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Mise à jour...
                </div>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralSettings;