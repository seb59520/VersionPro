import React, { useState } from 'react';
import { useStands } from '../../context/StandsContext';
import { useOrganization } from '../../context/OrganizationContext';
import { Building2, Plus, Calendar, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDateSafely } from '../../utils/dateUtils';
import AddStandModal from '../AddStandModal';
import EditStandModal from '../EditStandModal';

const StandSettings = () => {
  const { stands } = useStands();
  const { currentOrganization } = useOrganization();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStand, setEditingStand] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteStand = async (standId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce présentoir ?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'stands', standId));
      toast.success('Présentoir supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du présentoir');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStand = async (standId: string, data: any) => {
    try {
      setLoading(true);
      const standRef = doc(db, 'stands', standId);
      
      await updateDoc(standRef, {
        ...data,
        lastUpdated: serverTimestamp()
      });
      
      setEditingStand(null);
      toast.success('Présentoir mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du présentoir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des Présentoirs
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez vos présentoirs et leurs emplacements
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Ajouter un présentoir
        </button>
      </div>

      <div className="grid gap-6">
        {stands.map((stand) => (
          <div key={stand.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {stand.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {stand.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Installation: {formatDateSafely(stand.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingStand(stand.id)}
                  className="btn btn-secondary py-1.5 px-3"
                  disabled={loading}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteStand(stand.id)}
                  className="btn bg-red-50 text-red-600 hover:bg-red-100 py-1.5 px-3"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {stands.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun présentoir configuré
          </div>
        )}
      </div>

      {showAddModal && (
        <AddStandModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingStand && (
        <EditStandModal
          stand={stands.find(s => s.id === editingStand)!}
          isOpen={true}
          onClose={() => setEditingStand(null)}
        />
      )}
    </div>
  );
};

export default StandSettings;