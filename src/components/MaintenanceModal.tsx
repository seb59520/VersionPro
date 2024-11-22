import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Modal from './Modal';
import { DisplayStand, Maintenance } from '../types';
import { Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MaintenanceModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (standId: string, maintenance: Omit<Maintenance, 'id'>) => void;
  type: 'preventive' | 'curative';
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  stand,
  isOpen,
  onClose,
  onSubmit,
  type
}) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    performedBy: '',
    description: '',
    issues: '',
    resolution: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.performedBy.trim().length < 2) {
      toast.error('Le nom doit contenir au moins 2 caractères');
      return;
    }

    onSubmit(stand.id, {
      date: new Date(formData.date),
      type,
      performedBy: formData.performedBy,
      description: formData.description,
      issues: formData.issues,
      resolution: formData.resolution
    });

    onClose();
    toast.success('Maintenance enregistrée avec succès');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${type === 'preventive' ? 'Maintenance préventive' : 'Maintenance curative'} - ${stand.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de maintenance
          </label>
          <input
            type="date"
            className="input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effectuée par
          </label>
          <input
            type="text"
            className="input"
            value={formData.performedBy}
            onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
            required
            minLength={2}
            placeholder="Nom du technicien"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description des opérations
          </label>
          <textarea
            className="input"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
            placeholder="Détaillez les opérations effectuées"
          />
        </div>

        {type === 'curative' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problèmes constatés
              </label>
              <textarea
                className="input"
                value={formData.issues}
                onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                required
                rows={3}
                placeholder="Décrivez les problèmes rencontrés"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solutions apportées
              </label>
              <textarea
                className="input"
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                required
                rows={3}
                placeholder="Décrivez les solutions mises en place"
              />
            </div>
          </>
        )}

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
            Enregistrer la maintenance
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MaintenanceModal;