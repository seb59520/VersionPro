import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PosterRequest } from '../types';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PosterRequestListProps {
  requests: PosterRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const PosterRequestList: React.FC<PosterRequestListProps> = ({
  requests,
  onApprove,
  onReject,
}) => {
  const getStatusBadge = (status: PosterRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm">
            <AlertCircle className="h-4 w-4" />
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="h-4 w-4" />
            Approuvée
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">
            <XCircle className="h-4 w-4" />
            Refusée
          </span>
        );
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune demande de changement d'affiche
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="card p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900">
                  Demande pour: {request.requestedPoster}
                </h3>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Demandé le {format(new Date(request.requestDate), 'PPP', { locale: fr })}
                  </span>
                </div>
                <div className="mt-1">Par: {request.requestedBy}</div>
              </div>

              {request.notes && (
                <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {request.notes}
                </div>
              )}
            </div>

            {request.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(request.id)}
                  className="btn btn-primary"
                >
                  Approuver
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  className="btn btn-secondary"
                >
                  Refuser
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PosterRequestList;