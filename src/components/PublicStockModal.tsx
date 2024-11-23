import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { DisplayStand, Publication } from '../types';
import { AlertTriangle } from 'lucide-react';

interface PublicStockModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStock: (publicationId: string, quantity: number) => void;
  publications: Publication[];
}

const PublicStockModal: React.FC<PublicStockModalProps> = ({
  stand,
  isOpen,
  onClose,
  onUpdateStock,
  publications
}) => {
  const [stocks, setStocks] = useState<Record<string, number>>(() => {
    return (stand.publications || []).reduce((acc, pub) => ({
      ...acc,
      [pub.publicationId]: pub.quantity
    }), {});
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    Object.entries(stocks).forEach(([publicationId, quantity]) => {
      onUpdateStock(publicationId, quantity);
    });
    
    onClose();
    toast.success('Stock mis à jour avec succès');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mettre à jour le stock">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {stand.publications?.map((pub) => {
            const publication = publications.find(p => p.id === pub.publicationId);
            if (!publication) return null;

            return (
              <div key={pub.publicationId} className="card p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={publication.imageUrl}
                      alt={publication.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{publication.title}</h3>
                      {stocks[pub.publicationId] < publication.minStock && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Stock bas
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Quantité actuelle
                      </label>
                      <div className="mt-1 flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          className="input w-24"
                          value={stocks[pub.publicationId]}
                          onChange={(e) => setStocks({
                            ...stocks,
                            [pub.publicationId]: parseInt(e.target.value) || 0
                          })}
                        />
                        <span className="text-sm text-gray-500">
                          Minimum requis: {publication.minStock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

export default PublicStockModal;