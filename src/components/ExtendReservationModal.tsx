import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { format, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';

interface ExtendReservationModalProps {
  currentEndDate: string;
  isOpen: boolean;
  onClose: () => void;
  onExtend: (newEndDate: string) => void;
}

const ExtendReservationModal: React.FC<ExtendReservationModalProps> = ({
  currentEndDate,
  isOpen,
  onClose,
  onExtend
}) => {
  const [newEndDate, setNewEndDate] = useState(format(new Date(currentEndDate), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const current = new Date(currentEndDate);
    const newDate = new Date(newEndDate);
    
    if (newDate <= current) {
      toast.error('La nouvelle date doit être postérieure à la date actuelle');
      return;
    }

    if (newDate > addDays(current, 30)) {
      toast.error('La prolongation ne peut pas dépasser 30 jours');
      return;
    }

    onExtend(newEndDate);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Prolonger la réservation">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouvelle date de fin
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              className="input pl-10"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={format(addDays(new Date(currentEndDate), 1), 'yyyy-MM-dd')}
              max={format(addDays(new Date(currentEndDate), 30), 'yyyy-MM-dd')}
              required
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <ul className="space-y-1">
            <li>• La prolongation maximale est de 30 jours</li>
            <li>• La nouvelle date doit être postérieure à la date de fin actuelle</li>
          </ul>
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
            Prolonger
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExtendReservationModal;