import React from 'react';
import { useStands } from '../../context/StandsContext';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PublicationSettings = () => {
  const { publications, setPublications } = useStands();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newPublication, setNewPublication] = React.useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    minStock: 10
  });

  const handleAddPublication = () => {
    if (!newPublication.title || !newPublication.imageUrl) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setPublications(prev => [...prev, {
      id: crypto.randomUUID(),
      ...newPublication,
      isActive: true
    }]);
    setNewPublication({ title: '', description: '', imageUrl: '', category: '', minStock: 10 });
    setShowAddModal(false);
    toast.success('Publication ajoutée avec succès');
  };

  const handleRemovePublication = (publicationId: string) => {
    setPublications(prev => prev.filter(p => p.id !== publicationId));
    toast.success('Publication supprimée avec succès');
  };

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
          <div key={publication.id} className="card p-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
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
                <p className="text-sm text-gray-500 mt-1">{publication.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">{publication.category}</span>
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

      {/* Add Publication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Ajouter une nouvelle publication
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddPublication(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  className="input"
                  value={newPublication.title}
                  onChange={(e) => setNewPublication({ ...newPublication, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input"
                  value={newPublication.description}
                  onChange={(e) => setNewPublication({ ...newPublication, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image
                </label>
                <input
                  type="url"
                  className="input"
                  value={newPublication.imageUrl}
                  onChange={(e) => setNewPublication({ ...newPublication, imageUrl: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <input
                  type="text"
                  className="input"
                  value={newPublication.category}
                  onChange={(e) => setNewPublication({ ...newPublication, category: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock minimum
                </label>
                <input
                  type="number"
                  className="input"
                  value={newPublication.minStock}
                  onChange={(e) => setNewPublication({ ...newPublication, minStock: parseInt(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Ajouter
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