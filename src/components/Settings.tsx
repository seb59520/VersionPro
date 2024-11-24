import React from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { updateOrganization } from '../lib/organization';
import { toast } from 'react-hot-toast';
import { Building2, LayoutDashboard, FileText, BookOpen, Bell, User, Wrench } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import PosterSettings from './settings/PosterSettings';
import PublicationSettings from './settings/PublicationSettings';
import StandSettings from './settings/StandSettings';
import MaintenanceSettings from './settings/MaintenanceSettings';
import NotificationSettings from './settings/NotificationSettings';
import UserProfileSettings from './settings/UserProfileSettings';

const Settings = () => {
  const { currentOrganization, setCurrentOrganization } = useOrganization();
  
  const handleUpdate = async (field: string, value: string) => {
    if (!currentOrganization) return;

    try {
      const updatedOrg = {
        ...currentOrganization,
        [field]: value,
        updatedAt: new Date().toISOString()
      };

      await updateOrganization(currentOrganization.id, updatedOrg);
      setCurrentOrganization(updatedOrg);
      toast.success('Informations mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Paramètres de l'Organisation
        </h1>

        {currentOrganization && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="font-medium text-gray-900">{currentOrganization.name}</h2>
              <div className="text-sm text-gray-600">
                {currentOrganization.domain}
              </div>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="stands">
            <Building2 className="h-4 w-4 mr-2" />
            Présentoirs
          </TabsTrigger>
          <TabsTrigger value="posters">
            <FileText className="h-4 w-4 mr-2" />
            Affiches
          </TabsTrigger>
          <TabsTrigger value="publications">
            <BookOpen className="h-4 w-4 mr-2" />
            Publications
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Informations Générales
            </h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'organisation
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.name || ''}
                    onChange={(e) => handleUpdate('name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domaine
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.domain || ''}
                    onChange={(e) => handleUpdate('domain', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={currentOrganization?.email || ''}
                    onChange={(e) => handleUpdate('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={currentOrganization?.phone || ''}
                    onChange={(e) => handleUpdate('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.address || ''}
                    onChange={(e) => handleUpdate('address', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.city || ''}
                    onChange={(e) => handleUpdate('city', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.postalCode || ''}
                    onChange={(e) => handleUpdate('postalCode', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={currentOrganization?.country || ''}
                    onChange={(e) => handleUpdate('country', e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="stands">
          <StandSettings />
        </TabsContent>

        <TabsContent value="posters">
          <PosterSettings />
        </TabsContent>

        <TabsContent value="publications">
          <PublicationSettings />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;