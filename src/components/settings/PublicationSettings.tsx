import React, { useState, useEffect } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const PublicationSettings = () => {
  const { currentOrganization } = useOrganization();
  const { currentUser } = useAuth();
  const [publications, setPublications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    minStock: 10
  });

  useEffect(() => {
    if (!currentUser?.uid || !currentOrganization?.id) return;

    // Subscribe to publications collection
    const q = query(
      collection(db, 'publications'),
      where('organizationId', '==', currentOrganization.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const publicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPublications(publicationsData);
    });

    return () => unsubscribe();
  }, [currentUser?.uid, currentOrganization?.id]);

  const handleAddPublication = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.uid) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!currentOrganization?.id) {
      toast.error('Organisation non trouvée');
      return;
    }

    if (!formData.title || !formData.imageUrl) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);

      // Add publication to Firestore
      await addDoc(collection(db, 'publications'), {
        ...formData,
        isActive: true,
        organizationId: currentOrganization.id,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });

      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        category: '',
        minStock: 10
      });
      setShowAddModal(false);
      toast.success('Publication ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      let message = 'Erreur lors de l\'ajout de la publication';
      if (error.code === 'permission-denied') {
        message = 'Vous n\'avez pas les permissions nécessaires';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePublication = async (publicationId) => {
    if (!currentUser?.uid) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      await deleteDoc(doc(db, 'publications', publicationId));
      toast.success('Publication supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      let message = 'Erreur lors de la suppression';
      if (error.code === 'permission-denied') {
        message = 'Vous n\'avez pas les permissions nécessaires';
      }
      toast.error(message);
    }
  };

  if (!currentUser?.uid) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Veuillez vous connecter pour gérer les publications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Gestion des Publications
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez les publications et leurs stocks minimums
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Ajouter une publication
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {publications.map(publication => (
          <div key={publication.id} className="card p-4 bg-gray-50 border-2 border-gray-200">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                {publication.imageUrl ? (
                  <img
                    src={publication.imageUrl}
                    alt={publication.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{publication.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{publication.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm">
                      {publication.category}
                    </span>
                    <span className="text-sm text-gray-600 ml-4">
                      Stock min: {publication.minStock}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemovePublication(publication.id)}
                    className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Ajouter une nouvelle publication
            </h3>
            
            <form onSubmit={handleAddPublication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  className="input bg-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input bg-white"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image *
                </label>
                <input
                  type="url"
                  className="input bg-white"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <input
                  type="text"
                  className="input bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock minimum *
                </label>
                <input
                  type="number"
                  className="input bg-white"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      title: '',
                      description: '',
                      imageUrl: '',
                      category: '',
                      minStock: 10
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Ajout en cours...
                    </div>
                  ) : (
                    'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationSettings;