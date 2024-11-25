import React, { useState, useEffect, useRef } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Image, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { POSTER_CATEGORIES } from '../../constants/categories';
import Modal from '../Modal';

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
    category: '',
    file: null
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
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }

      setFormData({ ...formData, file });
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.uid || !currentOrganization?.id) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!formData.name || !formData.category || !formData.file) {
      toast.error('Veuillez remplir tous les champs obligatoires et sélectionner une image');
      return;
    }

    try {
      setLoading(true);

      // Upload de l'image vers Firebase Storage
      const storageRef = ref(storage, `posters/${currentOrganization.id}/${Date.now()}_${formData.file.name}`);
      const uploadResult = await uploadBytes(storageRef, formData.file);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Création du document dans Firestore
      await addDoc(collection(db, 'posters'), {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        imageUrl,
        storagePath: storageRef.fullPath,
        isActive: true,
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp()
      });

      setFormData({
        name: '',
        description: '',
        category: '',
        file: null
      });
      setPreviewImage(null);
      setShowAddModal(false);
      toast.success('Affiche ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout de l\'affiche');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoster = async (poster) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette affiche ?')) {
      return;
    }

    try {
      // Supprimer l'image du storage
      if (poster.storagePath) {
        const storageRef = ref(storage, poster.storagePath);
        await deleteObject(storageRef);
      }

      // Supprimer le document de Firestore
      await deleteDoc(doc(db, 'posters', poster.id));
      toast.success('Affiche supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

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

      <div className="space-y-8">
        {POSTER_CATEGORIES.map((category) => {
          const categoryPosters = posters.filter(p => p.category === category);
          if (categoryPosters.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryPosters.map((poster) => (
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
                          <button
                            onClick={() => handleDeletePoster(poster)}
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
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter une nouvelle affiche"
      >
        <form onSubmit={handleAddPoster} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'affiche *
            </label>
            <input
              type="text"
              className="input"
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
              className="input"
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
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {POSTER_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
                  category: '',
                  file: null
                });
              }}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
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
      </Modal>
    </div>
  );
};

export default PosterSettings;