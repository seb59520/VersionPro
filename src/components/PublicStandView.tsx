import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, ArrowLeft, BookOpen, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DisplayStand, Publication, Poster } from '../types';

const PublicStandView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stand, setStand] = useState<DisplayStand | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [availablePosters, setAvailablePosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (!id) return;

    // Charger les données du présentoir
    const standRef = doc(db, 'stands', id);
    const unsubscribe = onSnapshot(standRef, async (doc) => {
      if (doc.exists()) {
        const standData = { id: doc.id, ...doc.data() } as DisplayStand;
        setStand(standData);

        // Charger les publications associées
        if (standData.organizationId) {
          const publicationsQuery = query(
            collection(db, 'publications'),
            where('organizationId', '==', standData.organizationId)
          );
          const publicationsSnapshot = await getDocs(publicationsQuery);
          setPublications(publicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Publication[]);

          // Charger les affiches disponibles
          const postersQuery = query(
            collection(db, 'posters'),
            where('organizationId', '==', standData.organizationId),
            where('isActive', '==', true)
          );
          const postersSnapshot = await getDocs(postersQuery);
          setAvailablePosters(postersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Poster[]);
        }
      } else {
        setStand(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', stand.id);
      await updateDoc(standRef, {
        isReserved: true,
        reservedBy: reservationData.name,
        reservedUntil: new Date(reservationData.endDate).toISOString(),
        lastUpdated: new Date().toISOString(),
        reservationHistory: [
          ...(stand.reservationHistory || []),
          {
            startDate: new Date(reservationData.startDate).toISOString(),
            endDate: new Date(reservationData.endDate).toISOString(),
            reservedBy: reservationData.name
          }
        ]
      });
      
      setShowReservationModal(false);
      toast.success('Réservation effectuée avec succès');
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast.error('Erreur lors de la réservation');
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

  const hasLowStock = (stand.publications || []).some(pub => {
    const publication = publications.find(p => p.id === pub.publicationId);
    return publication && pub.quantity < publication.minStock;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-8 bg-white shadow-xl border-2 border-blue-100">
          <div className="space-y-8">
            {/* En-tête */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {stand.name}
                {stand.isReserved && (
                  <span className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full">
                    Réservé
                  </span>
                )}
              </h1>
              
              <div className="flex items-center text-gray-600 gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="text-lg">{stand.location}</span>
              </div>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Affiche actuelle
                  </h2>
                  <p className="text-gray-700">{stand.currentPoster}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Publications disponibles
                  </h2>
                  <div className="space-y-2">
                    {stand.publications?.map((pub, index) => {
                      const publication = publications.find(p => p.id === pub.publicationId);
                      if (!publication) return null;
                      
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-700">{publication.title}</span>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            pub.quantity < (publication.minStock || 0)
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {pub.quantity} exemplaires
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {stand.isReserved ? (
                  <div className="p-6 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center text-red-700 mb-3">
                      <User className="h-5 w-5 mr-2" />
                      <span className="font-medium">Réservé par: {stand.reservedBy}</span>
                    </div>
                    <div className="flex items-center text-red-700">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>
                        Jusqu'au: {format(new Date(stand.reservedUntil!), 'PPP', { locale: fr })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="text-lg font-medium text-green-800 mb-3">
                      Présentoir disponible
                    </h3>
                    <p className="text-green-700 mb-4">
                      Vous pouvez réserver ce présentoir pour vos affiches et publications.
                    </p>
                    <button
                      onClick={() => setShowReservationModal(true)}
                      className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl w-full"
                    >
                      Réserver maintenant
                    </button>
                  </div>
                )}

                {hasLowStock && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-yellow-700">
                      Certaines publications sont en stock limité
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      <Modal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        title="Réserver le présentoir"
      >
        <form onSubmit={handleReservation} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre nom
            </label>
            <input
              type="text"
              required
              className="input"
              value={reservationData.name}
              onChange={(e) => setReservationData({ ...reservationData, name: e.target.value })}
              placeholder="Entrez votre nom"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                required
                className="input"
                value={reservationData.startDate}
                onChange={(e) => setReservationData({ ...reservationData, startDate: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                required
                className="input"
                value={reservationData.endDate}
                onChange={(e) => setReservationData({ ...reservationData, endDate: e.target.value })}
                min={reservationData.startDate || format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <ul className="space-y-1">
              <li>• Durée maximale de réservation : 30 jours</li>
              <li>• La réservation commence le lendemain</li>
              <li>• Vous recevrez une confirmation par email</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowReservationModal(false)}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Confirmer la réservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PublicStandView;