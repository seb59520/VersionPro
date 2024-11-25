import React, { useState, useRef, useEffect } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { Plus, Trash2, Upload, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadImage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';

const PosterSettings = () => {
  const { currentOrganization } = useOrganization();
  const { currentUser } = useAuth();
  const [posters, setPosters] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: ''
  });

  useEffect(() => {
    if (!currentUser?.uid || !currentOrganization?.id) return;

    const q = query(
      collection(db, 'posters'),
      where('organizationId', '==', currentOrganization.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosters(postersData);
    });

    return () => unsubscribe();
  }, [currentUser?.uid, currentOrganization?.id]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.uid) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!currentOrganization?.id) {
      toast.error('Organisation non trouvée');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    try {
      setLoading(true);
      let imageUrl = formData.imageUrl;

      if (fileInputRef.current?.files?.[0]) {
        imageUrl = await uploadImage(fileInputRef.current.files[0], 'posters');
      }

      const posterData = {
        ...formData,
        imageUrl,
        isActive: true,
        organizationId: currentOrganization.id,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posters'), posterData);

      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        category: ''
      });
      setPreviewImage(null);
      setShowAddModal(false);
      toast.success('Affiche ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      let message = 'Erreur lors de l\'ajout de l\'affiche';
      if (error.code === 'permission-denied') {
        message = 'Vous n\'avez pas les permissions nécessaires';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.uid) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Veuillez vous connecter pour gérer les affiches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Gestion des Affiches
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez vos affiches et leurs informations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Ajouter une affiche
        </button>
      </div>

      {/* Liste des affiches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {posters.map((poster) => (
          <div key={poster.id} className="card p-4 bg-gray-50 border-2 border-gray-200">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                {poster.imageUrl ? (
                  <img
                    src={poster.imageUrl}
                    alt={poster.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{poster.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{poster.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm">
                    {poster.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Ajouter une nouvelle affiche
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'affiche *
                </label>
                <input
                  type="text"
                  className="input bg-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Image *
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir une image
                  </button>
                </div>
                {previewImage && (
                  <div className="mt-4">
                    <img
                      src={previewImage}
                      alt="Aperçu"
                      className="max-h-48 rounded-lg object-contain"
                    />
                  </div>
                )}
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setPreviewImage(null);
                    setFormData({
                      name: '',
                      description: '',
                      imageUrl: '',
                      category: ''
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

export default PosterSettings;