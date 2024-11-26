import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, ArrowLeft, BookOpen, AlertTriangle, FileText, Calendar, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DisplayStand } from '../types';
import Modal from './Modal';
import MaintenanceRequestModal from './MaintenanceRequestModal';
import PublicationList from './PublicationList';
import { formatDateSafely } from '../utils/dateUtils';
import ReservationModal from './ReservationModal';
import UsageReportModal from './UsageReportModal';

const PublicStandView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMaintenanceRequestModal, setShowMaintenanceRequestModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [stand, setStand] = useState<DisplayStand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStand = async () => {
      if (!id) return;

      try {
        const standDoc = await getDoc(doc(db, 'stands', id));
        if (standDoc.exists()) {
          setStand({ id: standDoc.id, ...standDoc.data() } as DisplayStand);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading stand:', error);
        toast.error('Erreur lors du chargement du présentoir');
        setLoading(false);
      }
    };

    loadStand();
  }, [id]);

  const handleReservation = async (data: { name: string; startDate: Date; endDate: Date }) => {
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', stand.id);
      await updateDoc(standRef, {
        isReserved: true,
        reservedBy: data.name,
        reservedUntil: data.endDate.toISOString(),
        lastUpdated: serverTimestamp()
      });

      setStand(prev => prev ? {
        ...prev,
        isReserved: true,
        reservedBy: data.name,
        reservedUntil: data.endDate.toISOString()
      } : null);

      toast.success('Présentoir réservé avec succès');
      setShowReservationModal(false);
    } catch (error) {
      console.error('Error making reservation:', error);
      toast.error('Erreur lors de la réservation');
    }
  };

  const handleUsageReport = async (data: { visitorsCount: number; usageHours: number }) => {
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', stand.id);
      await updateDoc(standRef, {
        usageHistory: [
          ...(stand.usageHistory || []),
          {
            date: new Date().toISOString(),
            visitorsCount: data.visitorsCount,
            usageHours: data.usageHours
          }
        ],
        lastUpdated: serverTimestamp()
      });

      toast.success('Rapport d\'utilisation enregistré');
      setShowUsageModal(false);
    } catch (error) {
      console.error('Error submitting usage report:', error);
      toast.error('Erreur lors de l\'envoi du rapport');
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
                  <>
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
                    <button
                      onClick={() => setShowUsageModal(true)}
                      className="btn bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl w-full"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Rapport d'utilisation
                    </button>
                  </>
                ) : (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      Présentoir disponible
                    </h3>
                    <p className="text-green-700 mb-4">
                      Ce présentoir est actuellement disponible pour réservation.
                    </p>
                    <button
                      onClick={() => setShowReservationModal(true)}
                      className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl w-full"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Réserver
                    </button>
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

      {showReservationModal && (
        <ReservationModal
          stand={stand}
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          onReserve={handleReservation}
        />
      )}

      {showUsageModal && (
        <UsageReportModal
          stand={stand}
          isOpen={showUsageModal}
          onClose={() => setShowUsageModal(false)}
          onSubmit={handleUsageReport}
        />
      )}
    </div>
  );
};

export default PublicStandView;