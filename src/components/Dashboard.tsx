import React from 'react';
import { useStands } from '../context/StandsContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import StandList from './StandList';
import { useOrganization } from '../context/OrganizationContext';
import { Building2, LayoutDashboard, BarChart2, Settings, Wrench } from 'lucide-react';

const Dashboard = () => {
  const { stands, publications } = useStands();
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();

  // Function to check low stock publications
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

  const handleReserve = async (standId: string, data: any) => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour réserver');
      return;
    }

    try {
      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        isReserved: true,
        reservedBy: data.name,
        reservedUntil: data.endDate,
        lastUpdated: serverTimestamp(),
        reservationHistory: [
          ...(stands.find(s => s.id === standId)?.reservationHistory || []),
          {
            startDate: data.startDate,
            endDate: data.endDate,
            reservedBy: data.name
          }
        ]
      });
      toast.success('Réservation effectuée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la réservation:', error);
      let message = 'Erreur lors de la réservation';
      if (error.code === 'permission-denied') {
        message = 'Vous n\'avez pas les permissions nécessaires';
      }
      toast.error(message);
    }
  };

  const handleCancelReservation = async (standId: string) => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour annuler une réservation');
      return;
    }

    try {
      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        isReserved: false,
        reservedBy: null,
        reservedUntil: null,
        lastUpdated: serverTimestamp()
      });
      toast.success('Réservation annulée');
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      let message = 'Erreur lors de l\'annulation';
      if (error.code === 'permission-denied') {
        message = 'Vous n\'avez pas les permissions nécessaires';
      }
      toast.error(message);
    }
  };

  const handlePosterRequest = async (standId: string, requestedPoster: string, notes: string) => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour faire une demande');
      return;
    }

    try {
      const stand = stands.find(s => s.id === standId);
      if (!stand) return;

      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        posterRequests: [
          ...(stand.posterRequests || []),
          {
            id: crypto.randomUUID(),
            requestedPoster,
            requestDate: serverTimestamp(),
            requestedBy: stand.reservedBy,
            status: 'pending',
            notes
          }
        ]
      });
      toast.success('Demande de changement d\'affiche envoyée');
    } catch (error: any) {
      console.error('Erreur lors de la demande:', error);
      let message = 'Erreur lors de la demande';
      if (error.code === 'permission-denied') {
        message = 'Vous n\'avez pas les permissions nécessaires';
      }
      toast.error(message);
    }
  };

  const handleUpdateStock = async (standId: string, publicationId: string, quantity: number) => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour mettre à jour le stock');
      return;
    }

    try {
      const stand = stands.find(s => s.id === standId);
      if (!stand) return;

      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        publications: (stand.publications || []).map(pub =>
          pub.publicationId === publicationId
            ? { ...pub, quantity, lastUpdated: serverTimestamp() }
            : pub
        )
      });
      toast.success('Stock mis à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      let message = 'Erreur lors de la mise à jour';
      if (error.code === 'permission-denied') {
        message = 'Vous n\'avez pas les permissions nécessaires';
      }
      toast.error(message);
    }
  };

  // Calculate statistics
  const stats = {
    total: stands.length,
    reserved: stands.filter(stand => stand.isReserved).length,
    available: stands.filter(stand => !stand.isReserved).length,
    needsMaintenance: stands.filter(stand => {
      const lastMaintenance = stand.maintenanceHistory?.slice(-1)[0];
      if (!lastMaintenance) return true;
      const nextMaintenance = new Date(lastMaintenance.date);
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 3);
      return new Date() > nextMaintenance;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tableau de Bord
          </h1>

          {/* Organization Info */}
          {currentOrganization && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-medium text-gray-900">{currentOrganization.name}</h2>
                <div className="text-sm text-gray-600 space-x-2">
                  <span>{currentOrganization.domain}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 text-white rounded-lg shadow-lg">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Présentoirs</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 text-white rounded-lg shadow-lg">
                <BarChart2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Présentoirs Disponibles</p>
                <p className="text-2xl font-bold text-green-900">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500 text-white rounded-lg shadow-lg">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Présentoirs Réservés</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.reserved}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500 text-white rounded-lg shadow-lg">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Maintenance Requise</p>
                <p className="text-2xl font-bold text-red-900">{stats.needsMaintenance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <StandList 
            stands={stands}
            getLowStockPublications={getLowStockPublications}
            onReserve={handleReserve}
            onCancelReservation={handleCancelReservation}
            onPosterRequest={handlePosterRequest}
            onUpdateStock={handleUpdateStock}
            availablePosters={[]}
            publications={publications}
            hoveredStandId={null}
            setHoveredStandId={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;