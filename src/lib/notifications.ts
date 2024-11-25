import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { toast } from 'react-hot-toast';

export interface Notification {
  id: string;
  type: 'reservation' | 'maintenance' | 'poster' | 'stock';
  title: string;
  message: string;
  organizationId: string;
  createdAt: Date;
  read: boolean;
  data?: any;
}

export const createNotification = async (
  organizationId: string,
  type: Notification['type'],
  title: string,
  message: string,
  data?: any
) => {
  try {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      type,
      title,
      message,
      organizationId,
      createdAt: serverTimestamp(),
      read: false,
      data
    });

    // Envoyer une notification par email si activé
    await sendEmailNotification(organizationId, type, title, message);

    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const subscribeToNotifications = (organizationId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    collection(db, 'notifications'),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    callback(notifications);
  });
};

const sendEmailNotification = async (organizationId: string, type: string, title: string, message: string) => {
  try {
    // Vérifier les paramètres de notification de l'organisation
    const orgDoc = await db.collection('organizations').doc(organizationId).get();
    const settings = orgDoc.data()?.settings?.emailNotifications;

    if (!settings) return;

    // Vérifier si le type de notification est activé
    switch (type) {
      case 'reservation':
        if (!settings.newReservation) return;
        break;
      case 'maintenance':
        if (!settings.maintenance) return;
        break;
      case 'poster':
        if (!settings.posterRequest) return;
        break;
      default:
        return;
    }

    // Récupérer les utilisateurs de l'organisation
    const usersSnapshot = await db.collection('users')
      .where('organizationId', '==', organizationId)
      .get();

    // Pour chaque utilisateur, envoyer un email
    const emailPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      
      // Ici, vous pouvez intégrer votre service d'envoi d'emails préféré
      // Par exemple : SendGrid, Mailgun, etc.
      
      // Pour l'instant, on simule l'envoi avec un toast
      toast.success(`Email envoyé à ${userData.email}: ${title}`);
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error sending email notifications:', error);
  }
};