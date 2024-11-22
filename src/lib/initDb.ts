import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Initial data for a new organization
const getInitialData = (userId: string) => ({
  stands: [
    {
      id: '001',
      name: 'Présentoir Entrée',
      location: 'Hall Principal',
      currentPoster: 'Bienvenue',
      isReserved: false,
      lastUpdated: new Date().toISOString(),
      organizationId: userId,
      createdAt: new Date('2024-01-01').toISOString(),
      maintenanceHistory: [],
      posterRequests: [],
      publications: []
    },
    {
      id: '002',
      name: 'Présentoir Cafétéria',
      location: 'Zone de Restauration',
      currentPoster: 'Menu',
      isReserved: false,
      lastUpdated: new Date().toISOString(),
      organizationId: userId,
      createdAt: new Date('2023-06-01').toISOString(),
      maintenanceHistory: [],
      posterRequests: [],
      publications: []
    }
  ],
  posters: [
    {
      id: '1',
      name: 'Affiche Bienvenue',
      description: 'Affiche de bienvenue standard',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
      category: 'Standard',
      isActive: true,
      organizationId: userId,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Menu du Jour',
      description: 'Affiche pour le menu de la cafétéria',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      category: 'Menu',
      isActive: true,
      organizationId: userId,
      createdAt: new Date().toISOString()
    }
  ],
  publications: [
    {
      id: '1',
      title: 'Guide Visiteur',
      description: 'Guide complet pour les visiteurs',
      imageUrl: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14',
      category: 'Guides',
      isActive: true,
      minStock: 10,
      organizationId: userId,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Programme Mensuel',
      description: 'Programme des activités du mois',
      imageUrl: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335',
      category: 'Programmes',
      isActive: true,
      minStock: 15,
      organizationId: userId,
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    baseUrl: window.location.origin + '/stand/',
    maxReservationDays: 30,
    minAdvanceHours: 24,
    emailNotifications: {
      newReservation: true,
      posterRequest: true,
      maintenance: true
    },
    maintenance: {
      preventiveIntervalMonths: 3,
      emailNotifications: true
    },
    assembly: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',
      email: ''
    }
  }
});

export const initializeDatabase = async (userId: string, email: string) => {
  try {
    // Check if user already has data
    const standsQuery = query(
      collection(db, 'stands'),
      where('organizationId', '==', userId)
    );
    const existingStands = await getDocs(standsQuery);
    
    if (!existingStands.empty) {
      console.log('Database already initialized for user');
      return;
    }

    // Get initial data
    const initialData = getInitialData(userId);

    // Create user profile
    await setDoc(doc(db, 'users', userId), {
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
      permissions: ['all']
    });

    // Create settings
    await setDoc(doc(db, 'settings', userId), initialData.settings);

    // Create stands
    for (const stand of initialData.stands) {
      await setDoc(doc(collection(db, 'stands')), stand);
    }

    // Create posters
    for (const poster of initialData.posters) {
      await setDoc(doc(collection(db, 'posters')), poster);
    }

    // Create publications
    for (const publication of initialData.publications) {
      await setDoc(doc(collection(db, 'publications')), publication);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};