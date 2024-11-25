import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, ArrowLeft, BookOpen, AlertTriangle, FileText, Calendar, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DisplayStand } from '../types';
import Modal from './Modal';
import MaintenanceRequestModal from './MaintenanceRequestModal';
import PublicationList from './PublicationList';
import { formatDateSafely } from '../utils/dateUtils';

const PublicStandView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMaintenanceRequestModal, setShowMaintenanceRequestModal] = useState(false);
  const [stand, setStand] = useState<DisplayStand | null>(null);
  const [loading, setLoading] = useState(true);

  const handleMaintenanceRequest = async (data: { description: string; issues: string }) => {
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', stand.id);
      await updateDoc(standRef, {
        maintenanceHistory: [
          ...(stand.maintenanceHistory || []),
          {
            id: crypto.randomUUID(),
            type: 'curative',
            date: new Date().toISOString(),
            issues: data.issues,
            description: data.description,
            status: 'pending',
            requestedBy: stand.reservedBy || 'Anonyme'
          }
        ],
        lastUpdated: serverTimestamp()
      });

      toast.success('Demande de maintenance envoyée avec succès');
      setShowMaintenanceRequestModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!stand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Présentoir non trouvé
          </h2>
          <p className="text-gray-600 mb-6">
            Le présentoir demandé n'existe pas ou n'est plus disponible.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card p-8 bg-white shadow-xl border-2 border-blue-100">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{stand.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  stand.isReserved 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {stand.isReserved ? 'Réservé' : 'Disponible'}
                </span>
              </div>
            </div>

            <div className="flex items-center text-gray-600 gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="text-lg">{stand.location}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Publications associées
                  </h2>
                  <PublicationList
                    publications={stand.publications || []}
                    associations={stand.publicationAssociations || []}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {stand.isReserved ? (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center text-red-700 mb-2">
                      <User className="h-5 w-5 mr-2" />
                      <span className="font-medium">Réservé par: {stand.reservedBy}</span>
                    </div>
                    <div className="flex items-center text-red-700">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Jusqu'au: {formatDateSafely(stand.reservedUntil)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      Présentoir disponible
                    </h3>
                    <p className="text-green-700">
                      Ce présentoir est actuellement disponible pour réservation.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowMaintenanceRequestModal(true)}
                  className="btn bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Signaler un problème
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMaintenanceRequestModal && (
        <MaintenanceRequestModal
          stand={stand}
          isOpen={showMaintenanceRequestModal}
          onClose={() => setShowMaintenanceRequestModal(false)}
          onSubmit={handleMaintenanceRequest}
        />
      )}
    </div>
  );
};

export default PublicStandView;