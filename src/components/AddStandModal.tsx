import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { toast } from 'react-hot-toast';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Poster } from '../types';
import { Image } from 'lucide-react';

interface AddStandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddStandModal: React.FC<AddStandModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [availablePosters, setAvailablePosters] = useState<Poster[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    currentPoster: ''
  });

  // Charger les affiches disponibles
  useEffect(() => {
    const loadPosters = async () => {
      if (!currentOrganization?.id) return;

      try {
        const q = query(
          collection(db, 'posters'),
          where('organizationId', '==', currentOrganization.id),
          where('isActive', '==', true)
        );
        
        const snapshot = await getDocs(q);
        const posters = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Poster[];
        
        setAvailablePosters(posters);
      } catch (error) {
        console.error('Error loading posters:', error);
        toast.error('Erreur lors du chargement des affiches');
      }
    };

    loadPosters();
  }, [currentOrganization?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentOrganization) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error('Le nom doit contenir au moins 2 caractères');
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'stands'), {
        ...formData,
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        isReserved: false,
        maintenanceHistory: [],
        publications: [],
        posterRequests: [],
        reservationHistory: []
      });

      toast.success('Présentoir ajouté avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout du présentoir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un nouveau présentoir">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du présentoir *
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
            Localisation *
          </label>
          <input
            type="text"
            className="input"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
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
          >
            <option value="">Sélectionnez une affiche</option>
            {availablePosters.map((poster) => (
              <option key={poster.id} value={poster.name}>
                {poster.name}
              </option>
            ))}
          </select>

          {formData.currentPoster && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {(() => {
                const selectedPoster = availablePosters.find(p => p.name === formData.currentPoster);
                return selectedPoster ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                      {selectedPoster.imageUrl ? (
                        <img
                          src={selectedPoster.imageUrl}
                          alt={selectedPoster.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedPoster.name}</h4>
                      {selectedPoster.description && (
                        <p className="text-sm text-gray-600 mt-1">{selectedPoster.description}</p>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ajout en cours...
              </div>
            ) : (
              'Ajouter le présentoir'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStandModal;