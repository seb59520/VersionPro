import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DisplayStand, ReservationFormData, Poster, Publication } from '../types';
import { MapPin, Clock, User, FileText, AlertTriangle, BookOpen, ExternalLink, Wrench, Calendar } from 'lucide-react';
import ReservationModal from './ReservationModal';
import PosterRequestModal from './PosterRequestModal';
import PublicationStockModal from './PublicationStockModal';
import MaintenanceModal from './MaintenanceModal';
import { useOrganization } from '../context/OrganizationContext';
import { Link } from 'react-router-dom';
import { getStandAge, getAgeStatus } from '../utils/standUtils';

interface StandListProps {
  stands: DisplayStand[];
  onReserve: (standId: string, data: ReservationFormData) => void;
  onCancelReservation: (standId: string) => void;
  onPosterRequest: (standId: string, requestedPoster: string, notes: string) => void;
  onUpdateStock: (standId: string, publicationId: string, quantity: number) => void;
  availablePosters: Poster[];
  publications: Publication[];
  hoveredStandId: string | null;
  setHoveredStandId: (id: string | null) => void;
  getLowStockPublications: (standId: string) => any[];
}

const StandList: React.FC<StandListProps> = ({
  stands,
  onReserve,
  onCancelReservation,
  onPosterRequest,
  onUpdateStock,
  availablePosters,
  publications = [],
  hoveredStandId,
  setHoveredStandId,
  getLowStockPublications
}) => {
  const [selectedStand, setSelectedStand] = useState<DisplayStand | null>(null);
  const [posterRequestStand, setPosterRequestStand] = useState<DisplayStand | null>(null);
  const [stockModalStand, setStockModalStand] = useState<DisplayStand | null>(null);
  const [maintenanceModalStand, setMaintenanceModalStand] = useState<any>(null);
  const { currentOrganization } = useOrganization();

  // Default base URL if organization settings are not available
  const baseUrl = currentOrganization?.settings?.baseUrl || `${window.location.origin}/stand/`;

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return format(date, 'PPP', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className="card overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-bold text-gray-900">Liste des Présentoirs</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {stands.map((stand) => {
          const hasLowStock = getLowStockPublications(stand.id).length > 0;
          const publicUrl = `${baseUrl}${stand.id}`;
          const age = getStandAge(stand.createdAt);
          const ageStatus = getAgeStatus(stand.createdAt);
          
          return (
            <div key={stand.id} className="p-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link 
                      to={`/stand/${stand.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {stand.name}
                    </Link>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stand.isReserved 
                        ? 'bg-red-100/80 text-red-700 ring-1 ring-red-600/10' 
                        : 'bg-green-100/80 text-green-700 ring-1 ring-green-600/10'
                    }`}>
                      {stand.isReserved ? 'Réservé' : 'Disponible'}
                    </span>

                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      ageStatus.status === 'old'
                        ? 'bg-red-100 text-red-700'
                        : ageStatus.status === 'aging'
                        ? 'bg-yellow-100 text-yellow-700'
                        : ageStatus.status === 'good'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      {age}
                    </span>

                    {hasLowStock && (
                      <div className="relative">
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100/80 text-yellow-700 ring-1 ring-yellow-600/10 flex items-center gap-1 cursor-help"
                          onMouseEnter={() => setHoveredStandId(stand.id)}
                          onMouseLeave={() => setHoveredStandId(null)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Stock publications bas
                        </span>
                        
                        {hoveredStandId === stand.id && (
                          <div className="absolute left-0 top-full mt-2 z-10 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-100">
                            <h4 className="font-medium text-gray-900 mb-2">Publications à réapprovisionner :</h4>
                            <ul className="space-y-2">
                              {getLowStockPublications(stand.id).map((pub, idx) => (
                                <li key={idx} className="text-sm text-gray-600">
                                  {pub.title} ({pub.current}/{pub.required})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{stand.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Affiche actuelle: {stand.currentPoster}</span>
                    </div>
                    
                    {stand.isReserved && stand.reservedBy && stand.reservedUntil && (
                      <>
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Réservé par: {stand.reservedBy}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Jusqu'au: {formatDate(stand.reservedUntil)}</span>
                        </div>
                      </>
                    )}

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Groupe Réservation */}
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-indigo-900 text-center mb-3">
                          Réservation
                        </h4>
                        <div className="flex flex-col gap-2">
                          {stand.isReserved ? (
                            <>
                              <button
                                onClick={() => onCancelReservation(stand.id)}
                                className="btn bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg w-full"
                              >
                                Annuler la réservation
                              </button>
                              <button
                                onClick={() => setPosterRequestStand(stand)}
                                className="btn bg-gradient-to-r from-indigo-400 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-md hover:shadow-lg w-full"
                              >
                                Changer l'affiche
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedStand(stand)}
                              className="btn bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg w-full"
                            >
                              Réserver
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Groupe Stock */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-emerald-900 text-center mb-3">
                          Stock
                        </h4>
                        <button
                          onClick={() => setStockModalStand(stand)}
                          className="btn bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg w-full"
                        >
                          <BookOpen className="h-4 w-4" />
                          Gérer le stock
                        </button>
                      </div>

                      {/* Groupe Maintenance */}
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-amber-900 text-center mb-3">
                          Maintenance
                        </h4>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setMaintenanceModalStand({ stand, type: 'preventive' })}
                            className="btn bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg w-full"
                          >
                            <Wrench className="h-4 w-4" />
                            Préventive
                          </button>
                          <button
                            onClick={() => setMaintenanceModalStand({ stand, type: 'curative' })}
                            className="btn bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg w-full"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            Curative
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <QRCodeSVG
                      value={publicUrl}
                      size={96}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary inline-flex items-center text-sm px-3 py-1.5"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Accéder à la page publique
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedStand && (
        <ReservationModal
          stand={selectedStand}
          isOpen={true}
          onClose={() => setSelectedStand(null)}
          onReserve={onReserve}
        />
      )}

      {posterRequestStand && (
        <PosterRequestModal
          stand={posterRequestStand}
          isOpen={true}
          onClose={() => setPosterRequestStand(null)}
          onSubmit={onPosterRequest}
          availablePosters={availablePosters}
        />
      )}

      {stockModalStand && (
        <PublicationStockModal
          stand={stockModalStand}
          isOpen={true}
          onClose={() => setStockModalStand(null)}
          onUpdateStock={onUpdateStock}
          publications={publications}
        />
      )}

      {maintenanceModalStand && (
        <MaintenanceModal
          stand={maintenanceModalStand.stand}
          type={maintenanceModalStand.type}
          isOpen={true}
          onClose={() => setMaintenanceModalStand(null)}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
};

export default StandList;