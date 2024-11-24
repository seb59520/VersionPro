import React from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { toast } from 'react-hot-toast';

const MaintenanceSettings = () => {
  const { currentOrganization, setCurrentOrganization } = useOrganization();

  const handleUpdateSettings = async (field: string, value: any) => {
    if (!currentOrganization) return;

    try {
      const updatedSettings = {
        ...currentOrganization.settings,
        maintenance: {
          ...currentOrganization.settings.maintenance,
          [field]: value
        }
      };

      setCurrentOrganization({
        ...currentOrganization,
        settings: updatedSettings
      });

      toast.success('Paramètres de maintenance mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Paramètres de Maintenance
      </h2>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intervalle de maintenance préventive (mois)
          </label>
          <input
            type="number"
            min="1"
            max="12"
            className="input w-32"
            value={currentOrganization?.settings?.maintenance?.preventiveIntervalMonths || 3}
            onChange={(e) => handleUpdateSettings('preventiveIntervalMonths', parseInt(e.target.value))}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintenanceNotifications"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={currentOrganization?.settings?.maintenance?.emailNotifications || false}
            onChange={(e) => handleUpdateSettings('emailNotifications', e.target.checked)}
          />
          <label htmlFor="maintenanceNotifications" className="ml-2 block text-sm text-gray-900">
            Recevoir des notifications par email pour les maintenances
          </label>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceSettings;