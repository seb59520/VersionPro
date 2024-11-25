import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { DisplayStand, Publication } from '../types';
import { BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PublicationRequestModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (standId: string, publicationId: string, data: {
    startDate: Date;
    endDate?: Date;
    quantity: number;
    notes?: string;
  }) => void;
  publications: Publication[];
}

const PublicationRequestModal: React.FC<PublicationRequestModalProps> = ({
  stand,
  isOpen,
  onClose,
  onSubmit,
  publications
}) => {
  const [selectedPublication, setSelectedPublication] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPublication) {
      toast.error('Veuillez sélectionner une publication');
      return;
    }

    onSubmit(stand.id, selectedPublication, {
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      quantity,
      notes
    });
    onClose();
  };

  const selectedPublicationData = publications.find(p => p.id === selectedPublication);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Demande d'association de publications">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publication
          </label>
          <select
            className="input bg-white"
            value={selectedPublication}
            onChange={(e) => setSelectedPublication(e.target.value)}
            required
          >
            <option value="">Sélectionner une publication</option>
            {publications.map((pub) => (
              <option key={pub.id} value={pub.id}>
                {pub.title}
              </option>
            ))}
          </select>

          {selectedPublicationData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPublicationData.imageUrl}
                  alt={selectedPublicationData.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedPublicationData.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedPublicationData.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              className="input bg-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin (optionnel)
            </label>
            <input
              type="date"
              className="input bg-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité
          </label>
          <input
            type="number"
            min="1"
            className="input bg-white w-32"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            className="input bg-white"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Informations complémentaires..."
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

export default PublicationRequestModal;