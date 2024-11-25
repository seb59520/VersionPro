import React, { useState } from 'react';
import { useStands } from '../context/StandsContext';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { Building2, LayoutDashboard, BarChart2, Settings, Wrench, AlertTriangle, FileText, BookOpen } from 'lucide-react';
import StandList from './StandList';
import RequestsWidget from './widgets/RequestsWidget';
import LowStockWidget from './widgets/LowStockWidget';
import StatCard from './StatCard';

const Dashboard: React.FC = () => {
  const { stands, publications, availablePosters } = useStands();
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const [hoveredStandId, setHoveredStandId] = useState<string | null>(null);

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

  // Récupérer toutes les demandes en attente
  const pendingRequests = {
    posters: stands.reduce((acc, stand) => [
      ...acc,
      ...(stand.posterRequests || [])
        .filter(req => req.status === 'pending')
        .map(req => ({ ...req, standId: stand.id, standName: stand.name }))
    ], [] as any[]),
    
    maintenance: stands.reduce((acc, stand) => [
      ...acc,
      ...(stand.maintenanceHistory || [])
        .filter(m => m.status === 'pending')
        .map(m => ({ 
          ...m, 
          standId: stand.id, 
          standName: stand.name,
          requestDate: m.date
        }))
    ], [] as any[]),
    
    lowStock: stands.reduce((acc, stand) => {
      const lowStock = getLowStockPublications(stand.id);
      if (lowStock.length > 0) {
        acc.push({
          standId: stand.id,
          standName: stand.name,
          publications: lowStock
        });
      }
      return acc;
    }, [] as any[])
  };

  const handleUpdateStock = async (standId: string, publicationId: string, quantity: number) => {
    if (!currentUser) {
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
        )
      });
      toast.success('Stock mis à jour');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Erreur lors de la mise à jour');
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

      {/* Widgets des demandes en attente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RequestsWidget
          title="Changements d'Affiche"
          icon={<FileText className="h-5 w-5" />}
          requests={pendingRequests.posters}
          onApprove={async (requestId, standId) => {
            const stand = stands.find(s => s.id === standId);
            if (!stand) return;
            
            const request = stand.posterRequests?.find(r => r.id === requestId);
            if (!request) return;

            try {
              const standRef = doc(db, 'stands', standId);
              await updateDoc(standRef, {
                currentPoster: request.requestedPoster,
                posterRequests: stand.posterRequests?.map(r => 
                  r.id === requestId 
                    ? { ...r, status: 'approved', processedBy: currentUser?.email, processedAt: new Date().toISOString() }
                    : r
                )
              });
              toast.success('Demande approuvée');
            } catch (error) {
              console.error('Error approving request:', error);
              toast.error('Erreur lors de l\'approbation');
            }
          }}
          onReject={async (requestId, standId) => {
            const stand = stands.find(s => s.id === standId);
            if (!stand) return;

            try {
              const standRef = doc(db, 'stands', standId);
              await updateDoc(standRef, {
                posterRequests: stand.posterRequests?.map(r => 
                  r.id === requestId 
                    ? { ...r, status: 'rejected', processedBy: currentUser?.email, processedAt: new Date().toISOString() }
                    : r
                )
              });
              toast.success('Demande rejetée');
            } catch (error) {
              console.error('Error rejecting request:', error);
              toast.error('Erreur lors du rejet');
            }
          }}
        />

        <LowStockWidget
          requests={pendingRequests.lowStock}
          onProcess={handleUpdateStock}
        />

        <RequestsWidget
          title="Maintenance"
          icon={<Wrench className="h-5 w-5" />}
          requests={pendingRequests.maintenance}
          onApprove={async (requestId, standId) => {
            const stand = stands.find(s => s.id === standId);
            if (!stand) return;

            try {
              const standRef = doc(db, 'stands', standId);
              await updateDoc(standRef, {
                maintenanceHistory: stand.maintenanceHistory?.map(m => 
                  m.id === requestId
                    ? { ...m, status: 'approved', processedBy: currentUser?.email, processedAt: new Date().toISOString() }
                    : m
                )
              });
              toast.success('Maintenance effectuée');
            } catch (error) {
              console.error('Error completing maintenance:', error);
              toast.error('Erreur lors de la maintenance');
            }
          }}
          onReject={async (requestId, standId) => {
            const stand = stands.find(s => s.id === standId);
            if (!stand) return;

            try {
              const standRef = doc(db, 'stands', standId);
              await updateDoc(standRef, {
                maintenanceHistory: stand.maintenanceHistory?.map(m => 
                  m.id === requestId
                    ? { ...m, status: 'rejected', processedBy: currentUser?.email, processedAt: new Date().toISOString() }
                    : m
                )
              });
              toast.success('Demande rejetée');
            } catch (error) {
              console.error('Error rejecting maintenance:', error);
              toast.error('Erreur lors du rejet');
            }
          }}
        />
      </div>

      {/* Liste des présentoirs */}
      <div className="space-y-6">
        <StandList 
          stands={stands}
          getLowStockPublications={getLowStockPublications}
          onReserve={handleUpdateStock}
          onCancelReservation={handleUpdateStock}
          onPosterRequest={handleUpdateStock}
          onUpdateStock={handleUpdateStock}
          availablePosters={availablePosters}
          publications={publications}
          hoveredStandId={hoveredStandId}
          setHoveredStandId={setHoveredStandId}
        />
      </div>
    </div>
  );
};

export default Dashboard;