import React, { useState } from 'react';
import { useStands } from '../context/StandsContext';
import { useOrganization } from '../context/OrganizationContext';
import { format, addMonths, isBefore, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Wrench, AlertTriangle, Calendar, CheckCircle, Clock, Plus, Trash2, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import MaintenanceModal from './MaintenanceModal';
import MaintenanceList from './MaintenanceList';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const DEFAULT_MAINTENANCE_INTERVAL = 3; // Default interval in months

const MaintenanceDashboard = () => {
  const { stands, addMaintenance } = useStands();
  const { currentOrganization } = useOrganization();
  const [maintenanceModalStand, setMaintenanceModalStand] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'preventive' | 'curative'>('all');
  const [expandedStand, setExpandedStand] = useState<string | null>(null);

  // Get maintenance interval from organization settings or use default
  const maintenanceInterval = currentOrganization?.settings?.maintenance?.preventiveIntervalMonths || DEFAULT_MAINTENANCE_INTERVAL;

  const getNextMaintenanceDate = (lastMaintenance: Date) => {
    return addMonths(new Date(lastMaintenance), maintenanceInterval);
  };

  const needsMaintenance = (stand: any) => {
    if (!stand.lastMaintenance) return true;
    const nextMaintenance = getNextMaintenanceDate(stand.lastMaintenance);
    return isBefore(nextMaintenance, new Date());
  };

  // Calcul des statistiques de maintenance
  const maintenanceStats = {
    total: stands.reduce((acc, stand) => acc + (stand.maintenanceHistory?.length || 0), 0),
    preventive: stands.reduce((acc, stand) => 
      acc + (stand.maintenanceHistory?.filter(m => m.type === 'preventive').length || 0), 0),
    curative: stands.reduce((acc, stand) => 
      acc + (stand.maintenanceHistory?.filter(m => m.type === 'curative').length || 0), 0),
    upcoming: stands.filter(stand => needsMaintenance(stand)).length,
    averageTimeBetweenFailures: calculateAverageTimeBetweenFailures(),
  };

  function calculateAverageTimeBetweenFailures() {
    let totalDays = 0;
    let count = 0;

    stands.forEach(stand => {
      const curativeMaintenances = stand.maintenanceHistory?.filter(m => m.type === 'curative') || [];
      if (curativeMaintenances.length > 1) {
        for (let i = 1; i < curativeMaintenances.length; i++) {
          const days = differenceInDays(
            new Date(curativeMaintenances[i].date),
            new Date(curativeMaintenances[i-1].date)
          );
          totalDays += days;
          count++;
        }
      }
    });

    return count > 0 ? Math.round(totalDays / count) : 0;
  }

  const calculateFailurePrediction = (stand: any) => {
    const age = differenceInDays(new Date(), new Date(stand.createdAt || Date.now()));
    const usageDays = (stand.reservationHistory || []).reduce((acc: number, res: any) => 
      acc + differenceInDays(new Date(res.endDate), new Date(res.startDate)), 0);
    const maintenanceCount = stand.maintenanceHistory?.length || 0;
    const curativeCount = stand.maintenanceHistory?.filter((m: any) => m.type === 'curative').length || 0;

    const ageRisk = Math.min(age / 365, 1) * 0.3;
    const usageRisk = Math.min(usageDays / 180, 1) * 0.4;
    const maintenanceRisk = Math.min(curativeCount / 5, 1) * 0.3;

    const totalRisk = (ageRisk + usageRisk + maintenanceRisk) * 100;
    return Math.min(Math.round(totalRisk), 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Maintenance des Présentoirs
        </h1>
        <p className="text-gray-600">
          Gérez les maintenances préventives et curatives des présentoirs
        </p>
      </div>

      {/* Organization Info */}
      {currentOrganization && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Organisation:</span>
            <span>{currentOrganization.name}</span>
            <span className="text-gray-400">•</span>
            <span>{currentOrganization.domain}</span>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/maintenance/all"
          className="card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 text-white rounded-lg shadow-lg">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total des maintenances</p>
              <p className="text-2xl font-bold text-blue-900">{maintenanceStats.total}</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/maintenance/preventive"
          className="card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 text-white rounded-lg shadow-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Maintenances préventives</p>
              <p className="text-2xl font-bold text-green-900">{maintenanceStats.preventive}</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/maintenance/curative"
          className="card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500 text-white rounded-lg shadow-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Maintenances curatives</p>
              <p className="text-2xl font-bold text-yellow-900">{maintenanceStats.curative}</p>
            </div>
          </div>
        </Link>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 text-white rounded-lg shadow-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Temps moyen entre pannes</p>
              <p className="text-2xl font-bold text-purple-900">{maintenanceStats.averageTimeBetweenFailures} jours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des présentoirs avec historique */}
      <div className="space-y-6">
        {stands.map((stand) => {
          const failureRisk = calculateFailurePrediction(stand);
          const isExpanded = expandedStand === stand.id;
          
          return (
            <div key={stand.id} className="card overflow-hidden border-2 hover:border-blue-200 transition-colors">
              <div 
                className="p-6 cursor-pointer hover:bg-blue-50/50 transition-colors"
                onClick={() => setExpandedStand(isExpanded ? null : stand.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">{stand.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg ${
                            failureRisk > 50 
                              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' 
                              : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                          }`}>
                            <span className="text-sm font-bold">
                              {failureRisk}%
                            </span>
                          </div>
                          <div className="absolute -top-2 -right-2">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold text-purple-700 bg-purple-100 rounded-full shadow-sm">
                              BETA
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">Risque de panne</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">{stand.location}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMaintenanceModalStand({ stand, type: 'preventive' });
                      }}
                      className="btn bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"
                    >
                      <Wrench className="h-4 w-4" />
                      Maintenance préventive
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMaintenanceModalStand({ stand, type: 'curative' });
                      }}
                      className="btn bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-md hover:shadow-lg"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Maintenance curative
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-6 bg-gradient-to-b from-blue-50 to-transparent">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Historique des maintenances
                  </h4>
                  <MaintenanceList maintenances={stand.maintenanceHistory || []} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modales */}
      {maintenanceModalStand && (
        <MaintenanceModal
          stand={maintenanceModalStand.stand}
          type={maintenanceModalStand.type}
          isOpen={true}
          onClose={() => setMaintenanceModalStand(null)}
          onSubmit={(standId, maintenance) => {
            addMaintenance(standId, maintenance);
            setMaintenanceModalStand(null);
            toast.success('Maintenance enregistrée avec succès');
          }}
        />
      )}
    </div>
  );
};

export default MaintenanceDashboard;