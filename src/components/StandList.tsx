import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DisplayStand, Publication, Poster } from '../types';
import { MapPin, Clock, User, FileText, AlertTriangle, BookOpen, ExternalLink, Wrench, Calendar, Image, Plus } from 'lucide-react';
import ReservationModal from './ReservationModal';
import PosterRequestModal from './PosterRequestModal';
import PublicationStockModal from './PublicationStockModal';
import PublicationRequestModal from './PublicationRequestModal';
import MaintenanceModal from './MaintenanceModal';

interface StandListProps {
  stands: DisplayStand[];
  onReserve: (standId: string, data: any) => void;
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
  publications,
  hoveredStandId,
  setHoveredStandId,
  getLowStockPublications
}) => {
  const [selectedStand, setSelectedStand] = useState<DisplayStand | null>(null);
  const [posterRequestStand, setPosterRequestStand] = useState<DisplayStand | null>(null);
  const [stockModalStand, setStockModalStand] = useState<DisplayStand | null>(null);
  const [maintenanceModalStand, setMaintenanceModalStand] = useState<any>(null);
  const [publicationModalStand, setPublicationModalStand] = useState<DisplayStand | null>(null);

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return '';
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
        {stands.map(stand => {
          const hasLowStock = getLowStockPublications(stand.id).length > 0;
          const posterImage = availablePosters.find(p => p.name === stand.currentPoster)?.imageUrl;
          
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
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        stand.isReserved 
                          ? 'bg-red-100/80 text-red-700 ring-1 ring-red-600/10' 
                          : 'bg-green-100/80 text-green-700 ring-1 ring-green-600/10'
                      }`}>
                        {stand.isReserved ? 'Réservé' : 'Disponible'}
                      </span>
                      
                      {hasLowStock && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100/80 text-yellow-700 ring-1 ring-yellow-600/10 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Stock bas
                        </span>
                      )}
                    </div>
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

                      {/* Groupe Publications */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-emerald-900 text-center mb-3">
                          Publications
                        </h4>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setPublicationModalStand(stand)}
                            className="btn bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Associer une publication
                          </button>
                          <button
                            onClick={() => setStockModalStand(stand)}
                            className={`btn bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-md hover:shadow-lg w-full ${
                              hasLowStock ? 'animate-pulse ring-2 ring-yellow-400' : ''
                            }`}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Gérer le stock
                            {hasLowStock && (
                              <AlertTriangle className="h-4 w-4 ml-2 text-yellow-200" />
                            )}
                          </button>
                        </div>
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
                            <Wrench className="h-4 w-4 mr-2" />
                            Préventive
                          </button>
                          <button
                            onClick={() => setMaintenanceModalStand({ stand, type: 'curative' })}
                            className="btn bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg w-full"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Curative
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  {posterImage ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                      <img
                        src={posterImage}
                        alt={stand.currentPoster}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <QRCodeSVG
                        value={`${window.location.origin}/stand/${stand.id}`}
                        size={96}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <Link
                      to={`/stand/${stand.id}`}
                      className="btn btn-secondary inline-flex items-center text-sm px-3 py-1.5"
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      Accéder à la page publique
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
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

      {publicationModalStand && (
        <PublicationRequestModal
          stand={publicationModalStand}
          isOpen={true}
          onClose={() => setPublicationModalStand(null)}
          onSubmit={(standId, publicationId, data) => {
            // Gérer l'association de publication ici
            console.log('Association publication:', { standId, publicationId, data });
          }}
          publications={publications}
        />
      )}

      {maintenanceModalStand && (
        <MaintenanceModal
          stand={maintenanceModalStand.stand}
          type={maintenanceModalStand.type}
          isOpen={true}
          onClose={() => setMaintenanceModalStand(null)}
          onSubmit={onUpdateStock}
        />
      )}
    </div>
  );
};

export default StandList;