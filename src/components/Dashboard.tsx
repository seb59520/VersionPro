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
import { createNotification } from '../lib/notifications';

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
        )
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