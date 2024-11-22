import React, { useState } from 'react';
import Modal from './Modal';
import { useStands } from '../context/StandsContext';
import { useAuth } from '../context/AuthContext';
import { DisplayStand } from '../types';
import { toast } from 'react-hot-toast';
import { Plus, Minus } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AddStandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddStandModal: React.FC<AddStandModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { availablePosters, publications } = useStands();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    currentPoster: '',
  });

  const [selectedPublications, setSelectedPublications] = useState<Array<{
    publicationId: string;
    quantity: number;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error('Le nom doit contenir au moins 2 caractères');
      return;
    }

    if (formData.location.trim().length < 2) {
      toast.error('La localisation doit contenir au moins 2 caractères');
      return;
    }

    try {
      // Créer le nouveau présentoir directement dans Firestore
      const standData = {
        name: formData.name,
        location: formData.location,
        currentPoster: formData.currentPoster,
        isReserved: false,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        maintenanceHistory: [],
        publications: selectedPublications,
        posterRequests: [],
        reservationHistory: [],
        organizationId: currentUser.uid
      };

      const docRef = await addDoc(collection(db, 'stands'), standData);
      
      toast.success('Présentoir ajouté avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du présentoir:', error);
      toast.error('Erreur lors de l\'ajout du présentoir');
    }
  };

  const handleAddPublication = () => {
    setSelectedPublications([...selectedPublications, { publicationId: '', quantity: 0 }]);
  };

  const handleRemovePublication = (index: number) => {
    setSelectedPublications(selectedPublications.filter((_, i) => i !== index));
  };

  const updatePublication = (index: number, field: 'publicationId' | 'quantity', value: string | number) => {
    const newPublications = [...selectedPublications];
    newPublications[index] = {
      ...newPublications[index],
      [field]: value
    };
    setSelectedPublications(newPublications);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Ajouter un nouveau présentoir"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du présentoir
          </label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            minLength={2}
            placeholder="Ex: Présentoir Hall Principal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Localisation
          </label>
          <input
            type="text"
            className="input"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            minLength={2}
            placeholder="Ex: Hall d'entrée"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Affiche actuelle
          </label>
          <select
            className="input"
            value={formData.currentPoster}
            onChange={(e) => setFormData({ ...formData, currentPoster: e.target.value })}
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Publications
            </label>
            <button
              type="button"
              onClick={handleAddPublication}
              className="btn btn-secondary py-1 px-2 h-8"
            >
              <Plus className="h-4 w-4" />
              Ajouter une publication
            </button>
          </div>

          <div className="space-y-3">
            {selectedPublications.map((pub, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <select
                    className="input mb-2"
                    value={pub.publicationId}
                    onChange={(e) => updatePublication(index, 'publicationId', e.target.value)}
                    required
                  >
                    <option value="">Sélectionnez une publication</option>
                    {publications.map((publication) => (
                      <option key={publication.id} value={publication.id}>
                        {publication.title}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Quantité:</label>
                    <input
                      type="number"
                      min="0"
                      className="input w-24"
                      value={pub.quantity}
                      onChange={(e) => updatePublication(index, 'quantity', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemovePublication(index)}
                  className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
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
            Ajouter le présentoir
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStandModal;