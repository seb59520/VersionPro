import React, { useState } from 'react';
import { LayoutDashboard, Users, Calendar, AlertCircle, BookOpen, TrendingUp, User, FileText, Wrench, ArrowUp, ArrowDown, Bell } from 'lucide-react';
import { useStands } from '../context/StandsContext';
import { useAuth } from '../context/AuthContext';
import StandList from './StandList';
import { ReservationFormData } from '../types';
import { toast } from 'react-hot-toast';
import { differenceInDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Modal from './Modal';
import PosterRequestList from './PosterRequestList';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { stands, setStands, availablePosters, publications = [], addMaintenance } = useStands();
  const [showPosterRequestsModal, setShowPosterRequestsModal] = React.useState(false);
  const [hoveredStandId, setHoveredStandId] = React.useState<string | null>(null);

  // Get all poster requests
  const allPosterRequests = stands.flatMap(stand => 
    (stand.posterRequests || []).map(request => ({
      ...request,
      standName: stand.name
    }))
  ).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  // Get pending poster requests
  const pendingPosterRequests = allPosterRequests.filter(request => request.status === 'pending');

  // Calculate stats
  const stats = {
    total: stands.length,
    reserved: stands.filter(stand => stand.isReserved).length,
    needsMaintenance: stands.filter(stand => {
      const lastMaintenance = stand.maintenanceHistory?.slice(-1)[0];
      if (!lastMaintenance) return true;
      const nextMaintenance = new Date(lastMaintenance.date);
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 3);
      return new Date() > nextMaintenance;
    }).length,
    lowStock: stands.filter(stand => 
      (stand.publications || []).some(pub => {
        const publication = publications.find(p => p.id === pub.publicationId);
        return publication && pub.quantity < publication.minStock;
      })
    ).length
  };

  // Get low stock publications for a stand
  const getLowStockPublications = (standId: string) => {
    const stand = stands.find(s => s.id === standId);
    if (!stand) return [];

    return (stand.publications || [])
      .map(pub => {
        const publication = publications.find(p => p.id === pub.publicationId);
        if (publication && pub.quantity < publication.minStock) {
          return {
            title: publication.title,
            current: pub.quantity,
            required: publication.minStock
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const handleReserve = (standId: string, data: ReservationFormData) => {
    setStands(prevStands => 
      prevStands.map(stand => 
        stand.id === standId
          ? {
              ...stand,
              isReserved: true,
              reservedBy: data.name,
              reservedUntil: data.endDate,
              lastUpdated: new Date(),
              reservationHistory: [
                ...(stand.reservationHistory || []),
                {
                  startDate: data.startDate,
                  endDate: data.endDate,
                  reservedBy: data.name
                }
              ]
            }
          : stand
      )
    );
    toast.success('Réservation effectuée avec succès');
  };

  const handleCancelReservation = (standId: string) => {
    setStands(prevStands =>
      prevStands.map(stand =>
        stand.id === standId
          ? {
              ...stand,
              isReserved: false,
              reservedBy: undefined,
              reservedUntil: undefined,
              lastUpdated: new Date()
            }
          : stand
      )
    );
    toast.success('Réservation annulée');
  };

  const handlePosterRequest = (standId: string, requestedPoster: string, notes: string) => {
    setStands(prevStands =>
      prevStands.map(stand =>
        stand.id === standId
          ? {
              ...stand,
              posterRequests: [
                ...(stand.posterRequests || []),
                {
                  id: crypto.randomUUID(),
                  standId,
                  requestedBy: stand.reservedBy!,
                  requestedPoster,
                  requestDate: new Date(),
                  status: 'pending',
                  notes
                }
              ]
            }
          : stand
      )
    );
    toast.success('Demande de changement d\'affiche envoyée');
  };

  const handleUpdateStock = (standId: string, publicationId: string, quantity: number) => {
    setStands(prevStands =>
      prevStands.map(stand =>
        stand.id === standId
          ? {
              ...stand,
              publications: (stand.publications || []).map(pub =>
                pub.publicationId === publicationId
                  ? { ...pub, quantity, lastUpdated: new Date() }
                  : pub
              )
            }
          : stand
      )
    );
    toast.success('Stock mis à jour');
  };

  const handleApprovePosterRequest = (requestId: string) => {
    setStands(prevStands =>
      prevStands.map(stand => ({
        ...stand,
        posterRequests: (stand.posterRequests || []).map(request =>
          request.id === requestId
            ? { ...request, status: 'approved' }
            : request
        ),
        currentPoster: stand.posterRequests?.find(r => r.id === requestId)?.requestedPoster || stand.currentPoster
      }))
    );
    toast.success('Demande approuvée');
  };

  const handleRejectPosterRequest = (requestId: string) => {
    setStands(prevStands =>
      prevStands.map(stand => ({
        ...stand,
        posterRequests: (stand.posterRequests || []).map(request =>
          request.id === requestId
            ? { ...request, status: 'rejected' }
            : request
        )
      }))
    );
    toast.error('Demande rejetée');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de Bord
            </h1>
            <p className="mt-2 text-gray-600">
              Bienvenue, {currentUser?.displayName || currentUser?.email}
            </p>
          </div>
          
          {pendingPosterRequests.length > 0 && (
            <button
              onClick={() => setShowPosterRequestsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span>{pendingPosterRequests.length} demande{pendingPosterRequests.length > 1 ? 's' : ''} en attente</span>
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/details/all" className="card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Présentoirs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Link>

          <Link to="/details/reserved" className="card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Présentoirs Réservés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reserved}</p>
              </div>
            </div>
          </Link>

          <Link to="/maintenance" className="card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-lg">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance Requise</p>
                <p className="text-2xl font-bold text-gray-900">{stats.needsMaintenance}</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/details/low-stock" 
            className="relative card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredStandId('low-stock')}
            onMouseLeave={() => setHoveredStandId(null)}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Publications Stock Bas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>

            {/* Tooltip for low stock details */}
            {hoveredStandId === 'low-stock' && stats.lowStock > 0 && (
              <div className="absolute left-0 top-full mt-2 z-10 w-72 p-4 bg-white rounded-lg shadow-xl border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Publications à réapprovisionner :</h4>
                <div className="space-y-2">
                  {stands.map(stand => {
                    const lowStockPubs = getLowStockPublications(stand.id);
                    if (lowStockPubs.length === 0) return null;

                    return (
                      <div key={stand.id} className="text-sm">
                        <p className="font-medium text-gray-700">{stand.name} :</p>
                        <ul className="ml-4 space-y-1">
                          {lowStockPubs.map((pub, idx) => (
                            <li key={idx} className="text-gray-600">
                              {pub.title} ({pub.current}/{pub.required})
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <StandList 
            stands={stands}
            onReserve={handleReserve}
            onCancelReservation={handleCancelReservation}
            onPosterRequest={handlePosterRequest}
            onUpdateStock={handleUpdateStock}
            onAddMaintenance={addMaintenance}
            availablePosters={availablePosters}
            publications={publications}
            hoveredStandId={hoveredStandId}
            setHoveredStandId={setHoveredStandId}
            getLowStockPublications={getLowStockPublications}
          />
        </div>

        {/* Poster Requests Modal */}
        <Modal
          isOpen={showPosterRequestsModal}
          onClose={() => setShowPosterRequestsModal(false)}
          title="Demandes de Changement d'Affiche"
        >
          <div className="max-h-[70vh] overflow-y-auto">
            <PosterRequestList
              requests={allPosterRequests}
              onApprove={handleApprovePosterRequest}
              onReject={handleRejectPosterRequest}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;