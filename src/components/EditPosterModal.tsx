import React, { useState } from 'react';
import Modal from './Modal';
import { Poster } from '../types';
import { toast } from 'react-hot-toast';
import { updatePoster } from '../lib/db';

interface EditPosterModalProps {
  poster: Poster;
  isOpen: boolean;
  onClose: () => void;
}

const EditPosterModal: React.FC<EditPosterModalProps> = ({
  poster,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: poster.name,
    description: poster.description || '',
    imageUrl: poster.imageUrl,
    category: poster.category,
    isActive: poster.isActive
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.imageUrl) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await updatePoster(poster.id, formData);
      toast.success('Affiche mise à jour avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de l\'affiche');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Modifier l'affiche"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'affiche
          </label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="input"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL de l'image
          </label>
          <input
            type="url"
            className="input"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            required
          />
          {formData.imageUrl && (
            <div className="mt-2">
              <img
                src={formData.imageUrl}
                alt="Aperçu"
                className="h-32 w-full object-cover rounded-lg"
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
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span className="ml-2 text-gray-700">Affiche active</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
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
    </Modal>
  );
};

export default EditPosterModal;