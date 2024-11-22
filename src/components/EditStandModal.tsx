import React, { useState } from 'react';
import Modal from './Modal';
import { DisplayStand } from '../types';
import { toast } from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { Link as LinkIcon } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface EditStandModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
}

const EditStandModal: React.FC<EditStandModalProps> = ({
  stand,
  isOpen,
  onClose
}) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: stand.name,
    location: stand.location,
    currentPoster: stand.currentPoster
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.name.trim().length < 2) {
      toast.error('Le nom doit contenir au moins 2 caractères');
      return;
    }

    try {
      const standRef = doc(db, 'stands', stand.id);
      await updateDoc(standRef, {
        ...formData,
        lastUpdated: new Date().toISOString()
      });
      
      toast.success('Présentoir mis à jour avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du présentoir');
    }
  };

  const publicUrl = `${settings.baseUrl}${stand.id}`;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Modifier le présentoir"
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Affiche actuelle
          </label>
          <input
            type="text"
            className="input"
            value={formData.currentPoster}
            onChange={(e) => setFormData({ ...formData, currentPoster: e.target.value })}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900">Code QR et lien public</h4>
          
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <QRCodeSVG
                value={publicUrl}
                size={96}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien public
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="input text-sm py-1.5"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    toast.success('Lien copié !');
                  }}
                  className="btn btn-secondary py-1.5 px-3"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
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
            Mettre à jour
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditStandModal;