import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { DisplayStand, ReservationFormData } from '../types';
import { validateReservationPeriod } from '../utils/reservationUtils';

interface ReservationModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  onReserve: (standId: string, data: ReservationFormData) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  stand,
  isOpen,
  onClose,
  onReserve,
}) => {
  const tomorrow = addDays(new Date(), 1);
  const [formData, setFormData] = useState<ReservationFormData>({
    name: '',
    startDate: tomorrow,
    endDate: addDays(tomorrow, 7),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.name.trim().length < 2) {
      toast.error('Le nom doit contenir au moins 2 caractères');
      return;
    }

    const validationError = validateReservationPeriod(formData.startDate, formData.endDate);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    onReserve(stand.id, formData);
    onClose();
    toast.success(`Présentoir réservé avec succès pour ${formData.name}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Réserver ${stand.name}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Votre nom
          </label>
          <input
            type="text"
            id="name"
            required
            minLength={2}
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Entrez votre nom"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              id="startDate"
              required
              min={format(tomorrow, 'yyyy-MM-dd')}
              className="input"
              value={format(formData.startDate, 'yyyy-MM-dd')}
              onChange={(e) => setFormData({
                ...formData,
                startDate: new Date(e.target.value),
                endDate: addDays(new Date(e.target.value), 7)
              })}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              id="endDate"
              required
              min={format(formData.startDate, 'yyyy-MM-dd')}
              className="input"
              value={format(formData.endDate, 'yyyy-MM-dd')}
              onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <ul className="space-y-1">
            <li>• Durée maximale de réservation : 30 jours</li>
            <li>• La réservation commence le lendemain</li>
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
            Réserver
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationModal;