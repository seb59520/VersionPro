import React, { useState } from 'react';
import { useStands } from '../context/StandsContext';
import { useSettings } from '../context/SettingsContext';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Trash2, Building2, User, Link as LinkIcon, Calendar } from 'lucide-react';
import Modal from './Modal';
import AddStandModal from './AddStandModal';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import UserProfileSettings from './UserProfileSettings';
import EditStandModal from './EditStandModal';
import EditPosterModal from './EditPosterModal';
import { getStandAge, getAgeStatus } from '../utils/standUtils';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { stands, availablePosters, publications, setAvailablePosters, setPublications, addStand, removeStand } = useStands();
  
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  const [showStandModal, setShowStandModal] = useState(false);
  const [editingStand, setEditingStand] = useState<string | null>(null);
  const [editingPoster, setEditingPoster] = useState<string | null>(null);
  const [newPoster, setNewPoster] = useState({ name: '', description: '', imageUrl: '', category: '' });
  const [newPublication, setNewPublication] = useState({ title: '', description: '', imageUrl: '', category: '', minStock: 10 });

  const handleSettingsUpdate = (newSettings: any) => {
    updateSettings({
      ...settings,
      ...newSettings
    });
    toast.success('Paramètres mis à jour avec succès');
  };

  const handleAddPoster = () => {
    if (!newPoster.name || !newPoster.imageUrl) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setAvailablePosters(prev => [...prev, {
      id: crypto.randomUUID(),
      ...newPoster,
      isActive: true
    }]);
    setNewPoster({ name: '', description: '', imageUrl: '', category: '' });
    setShowPosterModal(false);
    toast.success('Affiche ajoutée avec succès');
  };

  const handleRemovePoster = (posterId: string) => {
    setAvailablePosters(prev => prev.filter(p => p.id !== posterId));
    toast.success('Affiche supprimée avec succès');
  };

  const handleAddPublication = () => {
    if (!newPublication.title || !newPublication.imageUrl) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setPublications(prev => [...prev, {
      id: crypto.randomUUID(),
      ...newPublication,
      isActive: true
    }]);
    setNewPublication({ title: '', description: '', imageUrl: '', category: '', minStock: 10 });
    setShowPublicationModal(false);
    toast.success('Publication ajoutée avec succès');
  };

  const handleRemovePublication = (publicationId: string) => {
    setPublications(prev => prev.filter(p => p.id !== publicationId));
    toast.success('Publication supprimée avec succès');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="assembly">Assemblée</TabsTrigger>
          <TabsTrigger value="stands">Présentoirs</TabsTrigger>
          <TabsTrigger value="posters">Affiches</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
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
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    className="input flex-1"
                    value={settings.baseUrl}
                    onChange={(e) => handleSettingsUpdate({ baseUrl: e.target.value })}
                    placeholder="https://example.com/stand/"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(settings.baseUrl);
                      toast.success('URL copiée !');
                    }}
                    className="btn btn-secondary"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée maximale de réservation (jours)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={settings.maxReservationDays}
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
                    value={settings.minAdvanceHours}
                    onChange={(e) => handleSettingsUpdate({ minAdvanceHours: parseInt(e.target.value) })}
                    min="0"
                    max="72"
                  />
                </div>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="assembly">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Informations de l'Assemblée
            </h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'assemblée
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.assembly?.name || ''}
                    onChange={(e) => handleSettingsUpdate({
                      assembly: { ...settings.assembly, name: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={settings.assembly?.email || ''}
                    onChange={(e) => handleSettingsUpdate({
                      assembly: { ...settings.assembly, email: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.assembly?.address || ''}
                    onChange={(e) => handleSettingsUpdate({
                      assembly: { ...settings.assembly, address: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.assembly?.city || ''}
                    onChange={(e) => handleSettingsUpdate({
                      assembly: { ...settings.assembly, city: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.assembly?.postalCode || ''}
                    onChange={(e) => handleSettingsUpdate({
                      assembly: { ...settings.assembly, postalCode: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.assembly?.country || ''}
                    onChange={(e) => handleSettingsUpdate({
                      assembly: { ...settings.assembly, country: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={settings.assembly?.phone || ''}
                    onChange={(e) => handleSettingsUpdate({
                      assembly: { ...settings.assembly, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="stands">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Gestion des Présentoirs
                </h2>
                <p className="text-gray-600 mt-1">
                  Gérez vos présentoirs et leurs informations
                </p>
              </div>
              <button
                onClick={() => setShowStandModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Ajouter un présentoir
              </button>
            </div>
            
            <div className="space-y-4">
              {stands.map(stand => {
                const age = getStandAge(stand.createdAt);
                const ageStatus = getAgeStatus(stand.createdAt);

                return (
                  <div 
                    key={stand.id} 
                    className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <h3 className="font-medium text-gray-900">{stand.name}</h3>
                            
                            {/* Indicateur d'âge */}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                              ageStatus.status === 'old'
                                ? 'bg-red-100 text-red-700'
                                : ageStatus.status === 'aging'
                                ? 'bg-yellow-100 text-yellow-700'
                                : ageStatus.status === 'good'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              <Calendar className="h-4 w-4" />
                              {age}
                            </span>
                          </div>

                          <p className="text-gray-600 mt-1">{stand.location}</p>
                          
                          <div className="mt-4 flex items-center gap-4">
                            <button
                              onClick={() => setEditingStand(stand.id)}
                              className="btn btn-secondary text-sm"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => removeStand(stand.id)}
                              className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <QRCodeSVG
                            value={`${settings.baseUrl}${stand.id}`}
                            size={96}
                            level="H"
                            includeMargin={true}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${settings.baseUrl}${stand.id}`);
                              toast.success('Lien copié !');
                            }}
                            className="btn btn-secondary text-sm py-1 px-2"
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            Copier le lien
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posters">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Gestion des Affiches
                </h2>
                <p className="text-gray-600 mt-1">
                  Gérez vos affiches et leurs informations
                </p>
              </div>
              <button
                onClick={() => setShowPosterModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Ajouter une affiche
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePosters.map(poster => (
                <div key={poster.id} className="card p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={poster.imageUrl}
                        alt={poster.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{poster.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{poster.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm text-gray-600">{poster.category}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingPoster(poster.id)}
                            className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleRemovePoster(poster.id)}
                            className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="publications">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Gestion des Publications
                </h2>
                <p className="text-gray-600 mt-1">
                  Gérez vos publications et leurs stocks minimums
                </p>
              </div>
              <button
                onClick={() => setShowPublicationModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Ajouter une publication
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publications.map(publication => (
                <div key={publication.id} className="card p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={publication.imageUrl}
                        alt={publication.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{publication.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{publication.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">{publication.category}</span>
                          <span className="text-sm text-gray-600 ml-4">
                            Stock min: {publication.minStock}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemovePublication(publication.id)}
                          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Paramètres des notifications
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Notifications par email
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={settings.emailNotifications.newReservation}
                      onChange={(e) => handleSettingsUpdate({
                        emailNotifications: {
                          ...settings.emailNotifications,
                          newReservation: e.target.checked
                        }
                      })}
                    />
                    <span className="ml-2 text-gray-700">
                      Nouvelles réservations
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={settings.emailNotifications.posterRequest}
                      onChange={(e) => handleSettingsUpdate({
                        emailNotifications: {
                          ...settings.emailNotifications,
                          posterRequest: e.target.checked
                        }
                      })}
                    />
                    <span className="ml-2 text-gray-700">
                      Demandes de changement d'affiche
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={settings.emailNotifications.maintenance}
                      onChange={(e) => handleSettingsUpdate({
                        emailNotifications: {
                          ...settings.emailNotifications,
                          maintenance: e.target.checked
                        }
                      })}
                    />
                    <span className="ml-2 text-gray-700">
                      Rappels de maintenance
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <UserProfileSettings />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showStandModal && (
        <AddStandModal
          isOpen={showStandModal}
          onClose={() => setShowStandModal(false)}
        />
      )}

      {editingStand && (
        <EditStandModal
          stand={stands.find(s => s.id === editingStand)!}
          isOpen={true}
          onClose={() => setEditingStand(null)}
        />
      )}

      {editingPoster && (
        <EditPosterModal
          poster={availablePosters.find(p => p.id === editingPoster)!}
          isOpen={true}
          onClose={() => setEditingPoster(null)}
        />
      )}

      <Modal
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
        title="Ajouter une affiche"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAddPoster(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'affiche
            </label>
            <input
              type="text"
              className="input"
              value={newPoster.name}
              onChange={(e) => setNewPoster({ ...newPoster, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="input"
              value={newPoster.description}
              onChange={(e) => setNewPoster({ ...newPoster, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image
            </label>
            <input
              type="url"
              className="input"
              value={newPoster.imageUrl}
              onChange={(e) => setNewPoster({ ...newPoster, imageUrl: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              className="input"
              value={newPoster.category}
              onChange={(e) => setNewPoster({ ...newPoster, category: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPosterModal(false)}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Ajouter
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showPublicationModal}
        onClose={() => setShowPublicationModal(false)}
        title="Ajouter une publication"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAddPublication(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              className="input"
              value={newPublication.title}
              onChange={(e) => setNewPublication({ ...newPublication, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="input"
              value={newPublication.description}
              onChange={(e) => setNewPublication({ ...newPublication, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image
            </label>
            <input
              type="url"
              className="input"
              value={newPublication.imageUrl}
              onChange={(e) => setNewPublication({ ...newPublication, imageUrl: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              className="input"
              value={newPublication.category}
              onChange={(e) => setNewPublication({ ...newPublication, category: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock minimum
            </label>
            <input
              type="number"
              className="input"
              value={newPublication.minStock}
              onChange={(e) => setNewPublication({ ...newPublication, minStock: parseInt(e.target.value) })}
              min="0"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPublicationModal(false)}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Ajouter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;