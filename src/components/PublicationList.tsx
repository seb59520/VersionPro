import React from 'react';
import { Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import { Publication, PublicationAssociation } from '../types';
import { formatDateSafely } from '../utils/dateUtils';

interface PublicationListProps {
  publications: Publication[];
  associations: PublicationAssociation[];
  onRemoveAssociation: (associationId: string) => void;
}

const PublicationList: React.FC<PublicationListProps> = ({
  publications,
  associations,
  onRemoveAssociation
}) => {
  if (associations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune publication associée
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {associations.map((association) => {
        const publication = publications.find(p => p.id === association.publicationId);
        if (!publication) return null;

        return (
          <div key={association.id} className="card p-4 bg-gray-50">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white">
                {publication.imageUrl ? (
                  <img
                    src={publication.imageUrl}
                    alt={publication.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{publication.title}</h3>
                  {association.quantity < publication.minStock && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Stock bas
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Du {formatDateSafely(association.startDate)}
                      {association.endDate ? ` au ${formatDateSafely(association.endDate)}` : ''}
                    </span>
                  </div>
                  <div>Quantité: {association.quantity}</div>
                  {association.notes && (
                    <div className="mt-2 text-gray-500 italic">{association.notes}</div>
                  )}
                </div>

                {onRemoveAssociation && (
                  <div className="mt-3">
                    <button
                      onClick={() => onRemoveAssociation(association.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Retirer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PublicationList;