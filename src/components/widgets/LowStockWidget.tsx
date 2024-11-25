import React from 'react';
import { AlertTriangle, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LowStockWidgetProps {
  requests: Array<{
    standId: string;
    standName: string;
    publications: Array<{
      title: string;
      current: number;
      required: number;
    }>;
  }>;
  onProcess: (standId: string, publicationId: string) => void;
}

const LowStockWidget: React.FC<LowStockWidgetProps> = ({
  requests,
  onProcess
}) => {
  if (requests.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Stock Bas</h3>
        </div>
        <p className="text-gray-500 text-center py-4">
          Aucun stock à réapprovisionner
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Stock Bas</h3>
        </div>
        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
          {requests.length} présentoir{requests.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.standId} className="p-4 bg-gray-50 rounded-lg border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <Link 
                to={`/stand/${request.standId}`}
                className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {request.standName}
              </Link>
              <span className="text-sm text-orange-600">
                {request.publications.length} publication{request.publications.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="mt-2 space-y-2">
              {request.publications.map((pub, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-600">{pub.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-600 font-medium">
                      {pub.current}/{pub.required}
                    </span>
                    <button
                      onClick={() => onProcess(request.standId, pub.title)}
                      className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Réapprovisionner"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockWidget;