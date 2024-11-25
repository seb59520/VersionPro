import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { DisplayStand, Poster } from '../types';
import { FileText, Image } from 'lucide-react';
import { POSTER_CATEGORIES } from '../constants/categories';

interface PosterRequestModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (standId: string, requestedPoster: string, notes: string) => void;
  availablePosters: Poster[];
}

const PosterRequestModal: React.FC<PosterRequestModalProps> = ({
  stand,
  isOpen,
  onClose,
  onSubmit,
  availablePosters
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPoster, setSelectedPoster] = useState('');
  const [notes, setNotes] = useState('');

  const filteredPosters = selectedCategory
    ? availablePosters.filter(poster => poster.category === selectedCategory)
    : availablePosters;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPoster) {
      toast.error('Veuillez sélectionner une affiche');
      return;
    }

    try {
      onSubmit(stand.id, selectedPoster, notes);
      onClose();
    } catch (error) {
      console.error('Error submitting poster request:', error);
      toast.error('Erreur lors de la demande');
    }
  };

  const selectedPosterData = availablePosters.find(p => p.name === selectedPoster);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Demande de changement d'affiche">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Affiche actuelle
          </label>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center text-gray-600">
              <FileText className="h-5 w-5 mr-2 text-gray-400" />
              <span>{stand.currentPoster}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrer par catégorie
          </label>
          <select
            className="input bg-white mb-4"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedPoster(''); // Reset selected poster when category changes
            }}
          >
            <option value="">Toutes les catégories</option>
            {POSTER_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouvelle affiche souhaitée
          </label>
          <select
            className="input bg-white"
            value={selectedPoster}
            onChange={(e) => setSelectedPoster(e.target.value)}
            required
          >
            <option value="">Sélectionnez une affiche</option>
            {filteredPosters.map((poster) => (
              <option key={poster.id} value={poster.name}>
                {poster.name}
              </option>
            ))}
          </select>

          {selectedPosterData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {selectedPosterData.imageUrl ? (
                  <img
                    src={selectedPosterData.imageUrl}
                    alt={selectedPosterData.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{selectedPosterData.name}</h4>
                  {selectedPosterData.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedPosterData.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motif de la demande
          </label>
          <textarea
            className="input min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Expliquez pourquoi vous souhaitez changer l'affiche..."
            required
          />
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
            Envoyer la demande
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PosterRequestModal;