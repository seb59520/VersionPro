import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { Poster } from '../types';
import { FileText } from 'lucide-react';

interface PublicPosterRequestModalProps {
  currentPoster: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestedPoster: string, notes: string) => void;
  availablePosters: Poster[];
}

const PublicPosterRequestModal: React.FC<PublicPosterRequestModalProps> = ({
  currentPoster,
  isOpen,
  onClose,
  onSubmit,
  availablePosters
}) => {
  const [selectedPoster, setSelectedPoster] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPoster) {
      toast.error('Veuillez sélectionner une affiche');
      return;
    }

    onSubmit(selectedPoster, notes);
    onClose();
  };

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
              <span>{currentPoster}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouvelle affiche souhaitée
          </label>
          <select
            className="input"
            value={selectedPoster}
            onChange={(e) => setSelectedPoster(e.target.value)}
            required
          >
            <option value="">Sélectionnez une affiche</option>
            {availablePosters.map((poster) => (
              <option key={poster.id} value={poster.name}>
                {poster.name}
              </option>
            ))}
          </select>
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

export default PublicPosterRequestModal;