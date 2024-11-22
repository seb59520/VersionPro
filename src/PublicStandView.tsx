import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStands } from '../context/StandsContext';
import { MapPin, Calendar, User, ArrowLeft, BookOpen, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import PosterRequestModal from './PosterRequestModal';
import PublicationStockModal from './PublicationStockModal';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PublicStandView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stands, availablePosters, publications } = useStands();
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showPosterRequestModal, setShowPosterRequestModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  const stand = stands.find(s => s.id === id);

  const handleReservation = async (data: any) => {
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', stand.id);
      await updateDoc(standRef, {
        isReserved: true,
        reservedBy: data.name,
        reservedUntil: new Date(data.endDate).toISOString(),
        lastUpdated: serverTimestamp(),
        reservationHistory: [
          ...(stand.reservationHistory || []),
          {
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
            reservedBy: data.name
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

  const handlePosterRequest = async (requestedPoster: string, notes: string) => {
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', stand.id);
      await updateDoc(standRef, {
        posterRequests: [
          ...(stand.posterRequests || []),
          {
            id: crypto.randomUUID(),
            standId: stand.id,
            requestedBy: stand.reservedBy!,
            requestedPoster,
            requestDate: new Date().toISOString(),
            status: 'pending',
            notes
          }
        ]
      });
      
      setShowPosterRequestModal(false);
      toast.success('Demande de changement d\'affiche envoyée');
    } catch (error) {
      console.error('Erreur lors de la demande:', error);
      toast.error('Erreur lors de la demande');
    }
  };

  const handleUpdateStock = async (publicationId: string, quantity: number) => {
    if (!stand) return;

    try {
      const standRef = doc(db, 'stands', stand.id);
      await updateDoc(standRef, {
        publications: (stand.publications || []).map(pub =>
          pub.publicationId === publicationId
            ? { ...pub, quantity, lastUpdated: new Date().toISOString() }
            : pub
        )
      });
      
      toast.success('Stock mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

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
                            pub.quantity < publication.minStock
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

                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => setShowPosterRequestModal(true)}
                        className="btn bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl w-full"
                      >
                        Demander un changement d'affiche
                      </button>
                      
                      <button
                        onClick={() => setShowStockModal(true)}
                        className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl w-full"
                      >
                        Mettre à jour les stocks
                      </button>
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

      {/* Modals */}
      {showReservationModal && (
        <Modal
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          title="Réserver le présentoir"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleReservation({
              name: formData.get('name'),
              startDate: formData.get('startDate'),
              endDate: formData.get('endDate')
            });
          }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre nom
              </label>
              <input
                type="text"
                name="name"
                required
                className="input"
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
                  name="startDate"
                  required
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="input"
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
      )}

      {showPosterRequestModal && (
        <PosterRequestModal
          stand={stand}
          isOpen={true}
          onClose={() => setShowPosterRequestModal(false)}
          onSubmit={handlePosterRequest}
          availablePosters={availablePosters}
        />
      )}

      {showStockModal && (
        <PublicationStockModal
          stand={stand}
          isOpen={true}
          onClose={() => setShowStockModal(false)}
          onUpdateStock={handleUpdateStock}
          publications={publications}
        />
      )}
    </div>
  );
};

export default PublicStandView;