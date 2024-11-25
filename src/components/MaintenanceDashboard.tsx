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
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const MaintenanceDashboard: React.FC = () => {
  const { stands, addMaintenance } = useStands();
  const { currentOrganization } = useOrganization();
  const [maintenanceModalStand, setMaintenanceModalStand] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'preventive' | 'curative'>('all');
  const [expandedStand, setExpandedStand] = useState<string | null>(null);

  // Get maintenance interval from organization settings or use default
  const maintenanceInterval = currentOrganization?.settings?.maintenance?.preventiveIntervalMonths || 3;

  const getNextMaintenanceDate = (lastMaintenance: Date) => {
    return addMonths(new Date(lastMaintenance), maintenanceInterval);
  };

  const needsMaintenance = (stand: any) => {
    if (!stand.lastMaintenance) return true;
    const nextMaintenance = getNextMaintenanceDate(stand.lastMaintenance);
    return isBefore(nextMaintenance, new Date());
  };

  // Calculer les statistiques de maintenance
  const maintenanceStats = {
    total: stands.reduce((acc, stand) => acc + (stand.maintenanceHistory?.length || 0), 0),
    preventive: stands.reduce((acc, stand) => 
      acc + (stand.maintenanceHistory?.filter(m => m.type === 'preventive').length || 0), 0),
    curative: stands.reduce((acc, stand) => 
      acc + (stand.maintenanceHistory?.filter(m => m.type === 'curative').length || 0), 0),
    upcoming: stands.filter(stand => needsMaintenance(stand)).length,
    averageTimeBetweenFailures: calculateAverageTimeBetweenFailures(),
    pendingRequests: stands.reduce((acc, stand) => 
      acc + (stand.maintenanceHistory?.filter(m => m.status === 'pending').length || 0), 0
    )
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

  const handleApproveRequest = async (maintenanceId: string, standId: string) => {
    const stand = stands.find(s => s.id === standId);
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        maintenanceHistory: stand.maintenanceHistory?.map(m => 
          m.id === maintenanceId
            ? { ...m, status: 'approved', completedAt: new Date().toISOString() }
            : m
        ),
        lastUpdated: serverTimestamp()
      });
      toast.success('Maintenance approuvée');
    } catch (error) {
      console.error('Error approving maintenance:', error);
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleRejectRequest = async (maintenanceId: string, standId: string) => {
    const stand = stands.find(s => s.id === standId);
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        maintenanceHistory: stand.maintenanceHistory?.map(m => 
          m.id === maintenanceId
            ? { ...m, status: 'rejected', completedAt: new Date().toISOString() }
            : m
        ),
        lastUpdated: serverTimestamp()
      });
      toast.success('Maintenance rejetée');
    } catch (error) {
      console.error('Error rejecting maintenance:', error);
      toast.error('Erreur lors du rejet');
    }
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
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 text-white rounded-lg shadow-lg">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total des maintenances</p>
              <p className="text-2xl font-bold text-blue-900">{maintenanceStats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 text-white rounded-lg shadow-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Maintenances préventives</p>
              <p className="text-2xl font-bold text-green-900">{maintenanceStats.preventive}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500 text-white rounded-lg shadow-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Maintenances curatives</p>
              <p className="text-2xl font-bold text-yellow-900">{maintenanceStats.curative}</p>
              {maintenanceStats.pendingRequests > 0 && (
                <span className="px-2.5 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium mt-2 inline-block">
                  {maintenanceStats.pendingRequests} en attente
                </span>
              )}
            </div>
          </div>
        </div>

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
          const isExpanded = expandedStand === stand.id;
          const pendingMaintenances = stand.maintenanceHistory?.filter(m => m.status === 'pending') || [];
          
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
                      {pendingMaintenances.length > 0 && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          {pendingMaintenances.length} demande{pendingMaintenances.length > 1 ? 's' : ''} en attente
                        </span>
                      )}
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
                  {/* Demandes en attente */}
                  {pendingMaintenances.length > 0 && (
                    <div className="mb-6 space-y-4">
                      <h4 className="text-lg font-medium text-yellow-800">
                        Demandes en attente
                      </h4>
                      {pendingMaintenances.map((maintenance) => (
                        <div key={maintenance.id} className="card p-4 bg-yellow-50 border-2 border-yellow-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <h4 className="font-medium text-yellow-800">
                                  Demande de maintenance en attente
                                </h4>
                              </div>
                              <p className="text-sm text-yellow-700 mt-2">
                                {maintenance.issues}
                              </p>
                              <p className="text-sm text-yellow-600 mt-1">
                                Demandé par: {maintenance.requestedBy}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveRequest(maintenance.id, stand.id)}
                                className="btn btn-primary py-1 px-3"
                              >
                                Approuver
                              </button>
                              <button
                                onClick={() => handleRejectRequest(maintenance.id, stand.id)}
                                className="btn btn-secondary py-1 px-3"
                              >
                                Rejeter
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Historique des maintenances */}
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