import React, { useState, useRef } from 'react';
import { useStands } from '../../context/StandsContext';
import { useOrganization } from '../../context/OrganizationContext';
import { Plus, Trash2, Upload, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createPoster, updatePoster, deletePoster } from '../../lib/db';
import { Poster } from '../../types';

const PosterSettings: React.FC = () => {
  const { availablePosters, setAvailablePosters } = useStands();
  const { currentOrganization } = useOrganization();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPoster, setNewPoster] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPoster = async () => {
    if (!newPoster.name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const file = fileInputRef.current?.files?.[0];
      
      // Créer le poster dans Firestore
      const poster = await createPoster({
        ...newPoster,
        organizationId: currentOrganization?.id || ''
      }, file);

      setAvailablePosters(prev => [...prev, poster]);
      setNewPoster({ name: '', description: '', imageUrl: '', category: '' });
      setPreviewImage(null);
      setShowAddModal(false);
      toast.success('Affiche ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout de l\'affiche');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoster = async () => {
    if (!editingPoster) return;

    try {
      setLoading(true);
      const file = fileInputRef.current?.files?.[0];
      
      await updatePoster(editingPoster.id, editingPoster, file);

      setAvailablePosters(prev => prev.map(p => 
        p.id === editingPoster.id ? editingPoster : p
      ));
      setEditingPoster(null);
      setPreviewImage(null);
      toast.success('Affiche mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de l\'affiche');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePoster = async (posterId: string) => {
    try {
      await deletePoster(posterId);
      setAvailablePosters(prev => prev.filter(p => p.id !== posterId));
      toast.success('Affiche supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'affiche');
    }
  };

  return (
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
          onClick={() => setShowAddModal(true)}
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
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {poster.imageUrl ? (
                  <img
                    src={poster.imageUrl}
                    alt={poster.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{poster.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{poster.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{poster.category}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPoster(poster)}
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

      {/* Add/Edit Poster Modal */}
      {(showAddModal || editingPoster) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPoster ? 'Modifier l\'affiche' : 'Ajouter une nouvelle affiche'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              editingPoster ? handleUpdatePoster() : handleAddPoster();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'affiche
                </label>
                <input
                  type="text"
                  className="input"
                  value={editingPoster?.name || newPoster.name}
                  onChange={(e) => editingPoster 
                    ? setEditingPoster({ ...editingPoster, name: e.target.value })
                    : setNewPoster({ ...newPoster, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input"
                  value={editingPoster?.description || newPoster.description}
                  onChange={(e) => editingPoster
                    ? setEditingPoster({ ...editingPoster, description: e.target.value })
                    : setNewPoster({ ...newPoster, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir une image
                  </button>
                </div>
                {previewImage && (
                  <div className="mt-4">
                    <img
                      src={previewImage}
                      alt="Aperçu"
                      className="max-h-48 rounded-lg object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <input
                  type="text"
                  className="input"
                  value={editingPoster?.category || newPoster.category}
                  onChange={(e) => editingPoster
                    ? setEditingPoster({ ...editingPoster, category: e.target.value })
                    : setNewPoster({ ...newPoster, category: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPoster(null);
                    setPreviewImage(null);
                  }}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {editingPoster ? 'Mise à jour...' : 'Ajout...'}
                    </div>
                  ) : (
                    editingPoster ? 'Mettre à jour' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterSettings;