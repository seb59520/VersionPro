import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X } from 'lucide-react';

interface RequestsWidgetProps {
  title: string;
  icon: React.ReactNode;
  requests: any[];
  onApprove: (requestId: string, standId: string) => void;
  onReject?: (requestId: string, standId: string) => void;
}

const RequestsWidget: React.FC<RequestsWidgetProps> = ({
  title,
  icon,
  requests,
  onApprove,
  onReject
}) => {
  if (requests.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-500 text-center py-4">
          Aucune demande en attente
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {requests.length}
        </span>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {request.standName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {request.requestedPoster && `Nouvelle affiche: ${request.requestedPoster}`}
                  {request.type && `Type: ${request.type}`}
                </p>
                {request.notes && (
                  <p className="text-sm text-gray-500 mt-1 italic">
                    {request.notes}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {format(new Date(request.requestDate || request.date), 'PPp', { locale: fr })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApprove(request.id, request.standId)}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  title="Approuver"
                >
                  <Check className="h-5 w-5" />
                </button>
                {onReject && (
                  <button
                    onClick={() => onReject(request.id, request.standId)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Rejeter"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestsWidget;