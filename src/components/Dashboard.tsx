import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStands } from '../context/StandsContext';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { Building2, LayoutDashboard, BarChart2, Settings, Wrench, AlertTriangle, FileText, BookOpen, ExternalLink } from 'lucide-react';
import StandList from './StandList';
import RequestsWidget from './widgets/RequestsWidget';
import LowStockWidget from './widgets/LowStockWidget';
import StatCard from './StatCard';
import { createNotification } from '../lib/notifications';
import AddStandModal from './AddStandModal';
import PosterRequestModal from './PosterRequestModal';
import PublicationStockModal from './PublicationStockModal';
import MaintenanceModal from './MaintenanceModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { stands, publications, availablePosters, addMaintenance } = useStands();
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const [hoveredStandId, setHoveredStandId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStand, setSelectedStand] = useState(null);
  const [posterRequestStand, setPosterRequestStand] = useState(null);
  const [stockModalStand, setStockModalStand] = useState(null);
  const [maintenanceModalStand, setMaintenanceModalStand] = useState(null);

  // Fonction pour vérifier le stock bas
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

  // Calculer les statistiques
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
    }).length,
    lowStock: stands.reduce((count, stand) => 
      count + (getLowStockPublications(stand.id).length > 0 ? 1 : 0), 0
    )
  };

  const handleUpdateStock = async (standId: string, publicationId: string, quantity: number) => {
    if (!currentUser || !currentOrganization) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      const stand = stands.find(s => s.id === standId);
      if (!stand) return;

      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        publications: (stand.publications || []).map(pub =>
          pub.publicationId === publicationId
            ? { ...pub, quantity, lastUpdated: new Date().toISOString() }
            : pub
        ),
        lastUpdated: serverTimestamp()
      });

      // Créer une notification si le stock est bas
      const publication = publications.find(p => p.id === publicationId);
      if (publication && quantity < publication.minStock) {
        await createNotification(
          currentOrganization.id,
          'stock',
          'Stock bas',
          `Le stock de ${publication.title} est bas (${quantity}/${publication.minStock})`,
          { standId, publicationId, quantity }
        );
      }

      toast.success('Stock mis à jour');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleReserve = async (standId: string, data: any) => {
    try {
      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        isReserved: true,
        reservedBy: data.name,
        reservedUntil: data.endDate.toISOString(),
        lastUpdated: serverTimestamp()
      });
      toast.success('Réservation effectuée avec succès');
    } catch (error) {
      console.error('Error making reservation:', error);
      toast.error('Erreur lors de la réservation');
    }
  };

  const handleCancelReservation = async (standId: string) => {
    try {
      const standRef = doc(db, 'stands', standId);
      await updateDoc(standRef, {
        isReserved: false,
        reservedBy: null,
        reservedUntil: null,
        lastUpdated: serverTimestamp()
      });
      toast.success('Réservation annulée');
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const handlePosterRequest = async (standId: string, requestedPoster: string, notes: string) => {
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
            requestDate: new Date().toISOString(),
            status: 'pending',
            notes
          }
        ],
        lastUpdated: serverTimestamp()
      });

      toast.success('Demande d\'affiche envoyée');
    } catch (error) {
      console.error('Error requesting poster:', error);
      toast.error('Erreur lors de la demande');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de Bord
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Présentoirs"
          value={stats.total}
          icon={<LayoutDashboard className="h-6 w-6" />}
          color="from-blue-50 to-blue-100"
          link="/stands"
        />

        <StatCard
          title="Disponibles"
          value={stats.available}
          icon={<Building2 className="h-6 w-6" />}
          color="from-green-50 to-green-100"
          link="/stands/available"
        />

        <StatCard
          title="Réservés"
          value={stats.reserved}
          icon={<BarChart2 className="h-6 w-6" />}
          color="from-yellow-50 to-yellow-100"
          link="/stands/reserved"
        />

        <StatCard
          title="Maintenance"
          value={stats.needsMaintenance}
          icon={<Wrench className="h-6 w-6" />}
          color="from-red-50 to-red-100"
          link="/maintenance"
        />

        <StatCard
          title="Stock Bas"
          value={stats.lowStock}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="from-orange-50 to-orange-100"
          link="/stands/low-stock"
        />
      </div>

      {/* Liste des présentoirs */}
      <div className="space-y-6">
        <StandList 
          stands={stands}
          getLowStockPublications={getLowStockPublications}
          onReserve={handleReserve}
          onCancelReservation={handleCancelReservation}
          onPosterRequest={handlePosterRequest}
          onUpdateStock={handleUpdateStock}
          availablePosters={availablePosters}
          publications={publications}
          hoveredStandId={hoveredStandId}
          setHoveredStandId={setHoveredStandId}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddStandModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedStand && (
        <PosterRequestModal
          stand={selectedStand}
          isOpen={true}
          onClose={() => setSelectedStand(null)}
          onSubmit={handlePosterRequest}
          availablePosters={availablePosters}
        />
      )}

      {stockModalStand && (
        <PublicationStockModal
          stand={stockModalStand}
          isOpen={true}
          onClose={() => setStockModalStand(null)}
          onUpdateStock={handleUpdateStock}
          publications={publications}
        />
      )}

      {maintenanceModalStand && (
        <MaintenanceModal
          stand={maintenanceModalStand}
          type="preventive"
          isOpen={true}
          onClose={() => setMaintenanceModalStand(null)}
          onSubmit={(standId, maintenance) => {
            addMaintenance(standId, maintenance);
            setMaintenanceModalStand(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;