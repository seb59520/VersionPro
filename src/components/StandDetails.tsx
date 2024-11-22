import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStands } from '../context/StandsContext';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Calendar, Clock, Wrench, History, AlertTriangle } from 'lucide-react';
import { getStandAge, getAgeStatus, formatDate } from '../utils/standUtils';

const StandDetails = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { stands, publications } = useStands();

  const getFilteredStands = () => {
    switch (type) {
      case 'reserved':
        return stands.filter(stand => stand.isReserved);
      case 'available':
        return stands.filter(stand => !stand.isReserved);
      case 'low-stock':
        return stands.filter(stand => 
          (stand.publications || []).some(pub => {
            const publication = publications.find(p => p.id === pub.publicationId);
            return publication && pub.quantity < publication.minStock;
          })
        );
      default:
        return stands;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'reserved':
        return 'Présentoirs Réservés';
      case 'available':
        return 'Présentoirs Disponibles';
      case 'low-stock':
        return 'Présentoirs avec Stock Bas';
      default:
        return 'Tous les Présentoirs';
    }
  };

  const calculateUsageDays = (stand: any) => {
    const reservations = stand.reservationHistory || [];
    return reservations.reduce((total: number, res: any) => {
      if (!res.startDate || !res.endDate) return total;
      try {
        return total + differenceInDays(new Date(res.endDate), new Date(res.startDate));
      } catch (error) {
        console.error('Error calculating usage days:', error);
        return total;
      }
    }, 0);
  };

  const getNextMaintenance = (stand: any) => {
    const lastMaintenance = stand.lastMaintenance;
    if (!lastMaintenance) return new Date();
    
    try {
      const nextMaintenance = new Date(lastMaintenance);
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 3);
      return nextMaintenance;
    } catch (error) {
      console.error('Error calculating next maintenance:', error);
      return new Date();
    }
  };

  const filteredStands = getFilteredStands();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{getTitle()}</h1>
        </div>

        <div className="grid gap-6">
          {filteredStands.map(stand => {
            const age = getStandAge(stand.createdAt);
            const status = getAgeStatus(stand.createdAt);
            
            return (
              <div key={stand.id} className="card p-6">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{stand.name}</h2>
                      <p className="text-gray-600 mt-1">{stand.location}</p>
                    </div>
                    <div className="flex gap-3">
                      {stand.isReserved && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Réservé
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        status.status === 'old'
                          ? 'bg-red-100 text-red-700'
                          : status.status === 'aging'
                          ? 'bg-yellow-100 text-yellow-700'
                          : status.status === 'good'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        <Calendar className="h-4 w-4" />
                        {age}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                        <History className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jours d'utilisation</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {calculateUsageDays(stand)} jours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Prochaine maintenance</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(getNextMaintenance(stand))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dernière mise à jour</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(stand.lastUpdated)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {stand.reservationHistory && stand.reservationHistory.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Historique des réservations
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de début
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de fin
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Réservé par
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durée
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {stand.reservationHistory.map((reservation: any, index: number) => {
                              if (!reservation.startDate || !reservation.endDate) return null;
                              
                              try {
                                const startDate = new Date(reservation.startDate);
                                const endDate = new Date(reservation.endDate);
                                const duration = differenceInDays(endDate, startDate);

                                return (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {formatDate(startDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {formatDate(endDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {reservation.reservedBy}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {duration} jours
                                    </td>
                                  </tr>
                                );
                              } catch (error) {
                                console.error('Error formatting reservation dates:', error);
                                return null;
                              }
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StandDetails;