import React, { useState } from 'react';
import { useStands } from '../../context/StandsContext';
import { Plus, Trash2, Edit, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DisplayStand } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { useOrganization } from '../../context/OrganizationContext';

const StandSettings: React.FC = () => {
  const { stands, setStands } = useStands();
  const { currentOrganization } = useOrganization();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStand, setEditingStand] = useState<DisplayStand | null>(null);
  const [newStand, setNewStand] = useState({
    name: '',
    location: '',
    currentPoster: ''
  });

  const baseUrl = currentOrganization?.settings?.baseUrl || `${window.location.origin}/stand/`;

  const handleAddStand = () => {
    if (!newStand.name || !newStand.location) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const stand: DisplayStand = {
      id: crypto.randomUUID(),
      ...newStand,
      isReserved: false,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      maintenanceHistory: [],
      posterRequests: [],
      publications: [],
      organizationId: currentOrganization?.id || ''
    };

    setStands(prev => [...prev, stand]);
    setNewStand({ name: '', location: '', currentPoster: '' });
    setShowAddModal(false);
    toast.success('Présentoir ajouté avec succès');
  };

  const handleUpdateStand = (standId: string, data: Partial<DisplayStand>) => {
    setStands(prev => prev.map(stand => 
      stand.id === standId
        ? { ...stand, ...data, lastUpdated: new Date().toISOString() }
        : stand
    ));
    setEditingStand(null);
    toast.success('Présentoir mis à jour avec succès');
  };

  const handleRemoveStand = (standId: string) => {
    setStands(prev => prev.filter(stand => stand.id !== standId));
    toast.success('Présentoir supprimé avec succès');
  };

  return (
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
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Ajouter un présentoir
        </button>
      </div>

      <div className="space-y-4">
        {stands.map(stand => (
          <div key={stand.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900">{stand.name}</h3>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {stand.location}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Affiche actuelle: {stand.currentPoster}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingStand(stand)}
                      className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveStand(stand.id)}
                      className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <QRCodeSVG
                  value={`${baseUrl}${stand.id}`}
                  size={64}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Stand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Ajouter un nouveau présentoir
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddStand(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du présentoir
                </label>
                <input
                  type="text"
                  className="input"
                  value={newStand.name}
                  onChange={(e) => setNewStand({ ...newStand, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <input
                  type="text"
                  className="input"
                  value={newStand.location}
                  onChange={(e) => setNewStand({ ...newStand, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Affiche actuelle
                </label>
                <input
                  type="text"
                  className="input"
                  value={newStand.currentPoster}
                  onChange={(e) => setNewStand({ ...newStand, currentPoster: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
          </div>
        </div>
      )}

      {/* Edit Stand Modal */}
      {editingStand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Modifier le présentoir
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStand(editingStand.id, {
                name: editingStand.name,
                location: editingStand.location,
                currentPoster: editingStand.currentPoster
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du présentoir
                </label>
                <input
                  type="text"
                  className="input"
                  value={editingStand.name}
                  onChange={(e) => setEditingStand({
                    ...editingStand,
                    name: e.target.value
                  })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <input
                  type="text"
                  className="input"
                  value={editingStand.location}
                  onChange={(e) => setEditingStand({
                    ...editingStand,
                    location: e.target.value
                  })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Affiche actuelle
                </label>
                <input
                  type="text"
                  className="input"
                  value={editingStand.currentPoster}
                  onChange={(e) => setEditingStand({
                    ...editingStand,
                    currentPoster: e.target.value
                  })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStand(null)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandSettings;