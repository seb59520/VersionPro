import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { DisplayStand } from '../types';
import { Users, Clock } from 'lucide-react';

interface UsageReportModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { visitorsCount: number; usageHours: number }) => void;
}

const UsageReportModal: React.FC<UsageReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    visitorsCount: 0,
    usageHours: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.visitorsCount < 0 || formData.usageHours < 0) {
      toast.error('Les valeurs doivent être positives');
      return;
    }

    if (formData.usageHours > 24) {
      toast.error('Le nombre d\'heures ne peut pas dépasser 24');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rapport d'utilisation">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de visiteurs aujourd'hui
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                className="input pl-10"
                value={formData.visitorsCount}
                onChange={(e) => setFormData({
                  ...formData,
                  visitorsCount: parseInt(e.target.value) || 0
                })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heures d'utilisation aujourd'hui
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                className="input pl-10"
                value={formData.usageHours}
                onChange={(e) => setFormData({
                  ...formData,
                  usageHours: parseFloat(e.target.value) || 0
                })}
                required
              />
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
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UsageReportModal;