import { DisplayStand, Poster, Publication } from '../types';
import { format } from 'date-fns';

interface BackupData {
  stands: DisplayStand[];
  posters: Poster[];
  publications: Publication[];
  timestamp: string;
  version: string;
}

export const createBackup = (stands: DisplayStand[], posters: Poster[], publications: Publication[]): BackupData => {
  const backup: BackupData = {
    stands,
    posters,
    publications,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };

  return backup;
};

export const downloadBackup = (data: BackupData) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const timestamp = format(new Date(data.timestamp), 'yyyy-MM-dd-HH-mm');
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `presentoirs-backup-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const restoreFromBackup = async (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Validation basique
        if (!data.stands || !data.posters || !data.publications || !data.version) {
          throw new Error('Format de sauvegarde invalide');
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Erreur lors de la lecture du fichier de sauvegarde'));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsText(file);
  });
};