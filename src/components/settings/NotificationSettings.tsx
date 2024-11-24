import React from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';

const NotificationSettings = () => {
  const { currentOrganization, setCurrentOrganization } = useOrganization();

  const handleUpdateSettings = async (field: string, value: boolean) => {
    if (!currentOrganization) return;

    try {
      const updatedSettings = {
        ...currentOrganization.settings,
        emailNotifications: {
          ...currentOrganization.settings.emailNotifications,
          [field]: value
        }
      };

      setCurrentOrganization({
        ...currentOrganization,
        settings: updatedSettings
      });

      toast.success('Paramètres de notification mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Paramètres de Notification
          </h2>
          <p className="text-gray-600 text-sm">
            Gérez vos préférences de notification par email
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Nouvelles réservations</h3>
            <p className="text-sm text-gray-600">
              Recevoir une notification lors d'une nouvelle réservation
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={currentOrganization?.settings?.emailNotifications?.newReservation}
              onChange={(e) => handleUpdateSettings('newReservation', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Demandes d'affichage</h3>
            <p className="text-sm text-gray-600">
              Recevoir une notification pour les demandes de changement d'affiche
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={currentOrganization?.settings?.emailNotifications?.posterRequest}
              onChange={(e) => handleUpdateSettings('posterRequest', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Maintenance</h3>
            <p className="text-sm text-gray-600">
              Recevoir une notification pour les rappels de maintenance
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={currentOrganization?.settings?.emailNotifications?.maintenance}
              onChange={(e) => handleUpdateSettings('maintenance', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;