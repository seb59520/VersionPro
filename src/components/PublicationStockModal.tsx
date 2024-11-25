import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { DisplayStand, Publication } from '../types';
import { AlertTriangle } from 'lucide-react';
import { PUBLICATION_CATEGORIES } from '../constants/categories';

interface PublicationStockModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStock: (standId: string, publicationId: string, quantity: number) => void;
  publications: Publication[];
}

const PublicationStockModal: React.FC<PublicationStockModalProps> = ({
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
      onUpdateStock(stand.id, publicationId, quantity);
    });
    
    onClose();
    toast.success('Stock mis à jour avec succès');
  };

  const isLowStock = (publicationId: string, quantity: number) => {
    const publication = publications.find(p => p.id === publicationId);
    return publication && quantity < publication.minStock;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestion du stock des publications">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-8">
          {PUBLICATION_CATEGORIES.map((category) => {
            const categoryPublications = publications.filter(p => p.category === category);
            if (categoryPublications.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category}
                </h3>
                {categoryPublications.map(publication => {
                  const currentStock = stocks[publication.id] || 0;
                  const isLow = isLowStock(publication.id, currentStock);

                  return (
                    <div key={publication.id} className="card p-4">
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
                            {isLow && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Stock bas
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-1">{publication.description}</p>
                          
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Quantité en stock
                            </label>
                            <div className="mt-1 flex items-center gap-3">
                              <input
                                type="number"
                                min="0"
                                className="input w-24"
                                value={stocks[publication.id] || 0}
                                onChange={(e) => setStocks({
                                  ...stocks,
                                  [publication.id]: parseInt(e.target.value) || 0
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
            Mettre à jour le stock
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PublicationStockModal;