import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStands } from '../context/StandsContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Calendar, Clock, User, FileText, AlertTriangle, BookOpen, ArrowLeft } from 'lucide-react';
import Modal from './Modal';
import { toast } from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getStandAge, getAgeStatus } from '../utils/standUtils';

const StandDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stands } = useStands();
  const [showInstallDateModal, setShowInstallDateModal] = useState(false);
  const [installDate, setInstallDate] = useState('');

  const stand = stands.find(s => s.id === id);

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
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const age = getStandAge(stand.createdAt);
  const ageStatus = getAgeStatus(stand.createdAt);

  const handleUpdateInstallDate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'stands', stand.id), {
        createdAt: new Date(installDate).toISOString()
      });
      toast.success('Date d\'installation mise à jour');
      setShowInstallDateModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{stand.name}</h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {stand.location}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* État actuel */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">État actuel</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Affiche actuelle</span>
                <p className="text-lg font-medium text-gray-900">{stand.currentPoster}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Statut</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stand.isReserved
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {stand.isReserved ? 'Réservé' : 'Disponible'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Date d'installation</span>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-medium text-gray-900">
                    {format(new Date(stand.createdAt), 'PP', { locale: fr })}
                  </p>
                  <button
                    onClick={() => {
                      setInstallDate(format(new Date(stand.createdAt), 'yyyy-MM-dd'));
                      setShowInstallDateModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Modifier
                  </button>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Âge du présentoir</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    ageStatus.status === 'old'
                      ? 'bg-red-100 text-red-700'
                      : ageStatus.status === 'aging'
                      ? 'bg-yellow-100 text-yellow-700'
                      : ageStatus.status === 'good'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    <Calendar className="h-4 w-4" />
                    {age}
                  </span>
                  {ageStatus.status === 'old' && (
                    <span className="text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification de la date d'installation */}
      <Modal
        isOpen={showInstallDateModal}
        onClose={() => setShowInstallDateModal(false)}
        title="Modifier la date d'installation"
      >
        <form onSubmit={handleUpdateInstallDate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'installation
            </label>
            <input
              type="date"
              className="input"
              value={installDate}
              onChange={(e) => setInstallDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowInstallDateModal(false)}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StandDetailPage;