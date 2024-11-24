import React, { useState, useEffect } from 'react';
import { useStands } from '../context/StandsContext';
import { useOrganization } from '../context/OrganizationContext';
import { toast } from 'react-hot-toast';
import { debounce } from '../utils/debounce';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import PosterSettings from './settings/PosterSettings';
import PublicationSettings from './settings/PublicationSettings';
import StandSettings from './settings/StandSettings';
import UserProfileSettings from './UserProfileSettings';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Settings: React.FC = () => {
  const { currentOrganization, setCurrentOrganization } = useOrganization();
  const [baseUrl, setBaseUrl] = useState(currentOrganization?.settings?.baseUrl || `${window.location.origin}/stand/`);

  useEffect(() => {
    // Update baseUrl when organization changes
    if (currentOrganization?.settings?.baseUrl) {
      setBaseUrl(currentOrganization.settings.baseUrl);
    }
  }, [currentOrganization]);

  // Debounced update function to prevent too many notifications
  const handleSettingsUpdate = debounce(async (newSettings: any) => {
    if (currentOrganization) {
      try {
        const updatedSettings = {
          ...currentOrganization.settings,
          ...newSettings
        };

        // Update Firestore
        await updateDoc(doc(db, 'organizations', currentOrganization.id), {
          settings: updatedSettings
        });

        // Update local state
        setCurrentOrganization({
          ...currentOrganization,
          settings: updatedSettings
        });

        toast.success('Paramètres mis à jour avec succès');
      } catch (error) {
        console.error('Error updating settings:', error);
        toast.error('Erreur lors de la mise à jour des paramètres');
      }
    }
  }, 1000);

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="organization">Organisation</TabsTrigger>
          <TabsTrigger value="stands">Présentoirs</TabsTrigger>
          <TabsTrigger value="posters">Affiches</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Paramètres généraux
            </h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de base
                </label>
                <input
                  type="url"
                  className="input"
                  value={baseUrl}
                  onChange={(e) => {
                    setBaseUrl(e.target.value);
                    handleSettingsUpdate({ baseUrl: e.target.value });
                  }}
                  placeholder="https://example.com/stand/"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée maximale de réservation (jours)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={currentOrganization?.settings?.maxReservationDays || 30}
                    onChange={(e) => handleSettingsUpdate({ maxReservationDays: parseInt(e.target.value) })}
                    min="1"
                    max="90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Délai minimum de réservation (heures)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={currentOrganization?.settings?.minAdvanceHours || 24}
                    onChange={(e) => handleSettingsUpdate({ minAdvanceHours: parseInt(e.target.value) })}
                    min="0"
                    max="72"
                  />
                </div>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Rest of the component remains the same */}
        {/* ... */}
      </Tabs>
    </div>
  );
};

export default Settings;