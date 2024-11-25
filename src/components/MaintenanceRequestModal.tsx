import React, { useState } from 'react';
import Modal from './Modal';
import { DisplayStand } from '../types';
import { Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MaintenanceRequestModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { description: string; issues: string }) => void;
}

const MaintenanceRequestModal: React.FC<MaintenanceRequestModalProps> = ({
  stand,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    description: '',
    issues: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.issues) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Demande de maintenance curative"
    >
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-2 text-yellow-700 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Maintenance curative</span>
        </div>
        <p className="text-sm text-yellow-600">
          Utilisez ce formulaire pour signaler un problème nécessitant une intervention de maintenance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description du problème *
          </label>
          <textarea
            className="input"
            value={formData.issues}
            onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
            rows={3}
            required
            placeholder="Décrivez le problème rencontré..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actions déjà tentées *
          </label>
          <textarea
            className="input"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            required
            placeholder="Décrivez les actions que vous avez déjà tentées..."
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

export default MaintenanceRequestModal;