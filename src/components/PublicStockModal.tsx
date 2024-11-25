import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { DisplayStand, Publication } from '../types';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PublicStockModalProps {
  stand: DisplayStand;
  isOpen: boolean;
  onClose: () => void;
  publications: Publication[];
}

const PublicStockModal: React.FC<PublicStockModalProps> = ({
  stand,
  isOpen,
  onClose,
  publications
}) => {
  // Initialiser les stocks avec les valeurs actuelles des publications associées
  const [stocks, setStocks] = useState<Record<string, number>>(() => {
    const initialStocks: Record<string, number> = {};
    stand.publications?.forEach(pub => {
      initialStocks[pub.publicationId] = pub.quantity;
    });
    return initialStocks;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const standRef = doc(db, 'stands', stand.id);
      
      // Mettre à jour les publications avec les nouvelles quantités
      const updatedPublications = stand.publications?.map(pub => ({
        ...pub,
        quantity: stocks[pub.publicationId] || 0,
        lastUpdated: new Date().toISOString()
      })) || [];

      await updateDoc(standRef, {
        publications: updatedPublications,
        lastUpdated: serverTimestamp()
      });
      
      toast.success('Stock mis à jour avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      toast.error('Erreur lors de la mise à jour du stock');
    }
  };

  // Filtrer les publications pour n'afficher que celles associées au présentoir
  const associatedPublications = stand.publications?.map(pub => {
    const publicationDetails = publications.find(p => p.id === pub.publicationId);
    return publicationDetails ? {
      ...publicationDetails,
      currentQuantity: pub.quantity
    } : null;
  }).filter(Boolean) || [];

  const isLowStock = (publication: Publication, quantity: number) => {
    return quantity < publication.minStock;
  };

  if (associatedPublications.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Gestion du stock des publications">
        <div className="text-center py-8 text-gray-500">
          Aucune publication n'est associée à ce présentoir
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestion du stock des publications">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {associatedPublications.map((publication: any) => {
            const currentStock = stocks[publication.id] || 0;
            const isLow = isLowStock(publication, currentStock);

            return (
              <div key={publication.id} className="card p-4 bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {publication.imageUrl ? (
                      <img
                        src={publication.imageUrl}
                        alt={publication.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
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

export default PublicStockModal;