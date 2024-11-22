import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Maintenance } from '../types';
import { Wrench, AlertTriangle } from 'lucide-react';

interface MaintenanceListProps {
  maintenances: Maintenance[];
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({ maintenances }) => {
  if (maintenances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun historique de maintenance
      </div>
    );
  }

  const sortedMaintenances = [...maintenances].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedMaintenances.map((maintenance, index) => (
        <div key={maintenance.id || `maintenance-${index}`} className="card p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  maintenance.type === 'preventive' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {maintenance.type === 'preventive' ? <Wrench className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Maintenance {maintenance.type === 'preventive' ? 'préventive' : 'curative'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(maintenance.date), 'PPP', { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Effectuée par:</span> {maintenance.performedBy}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Description:</span> {maintenance.description}
                </p>
                {maintenance.type === 'curative' && (
                  <>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Problèmes:</span> {maintenance.issues}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Solutions:</span> {maintenance.resolution}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceList;