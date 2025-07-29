
import { Card, Folder } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

const FOLDERS_STORAGE_KEY = 'capturelearn-folders';

class StorageService {
  /**
   * Saves an array of cards to localStorage.
   * @param {Card[]} cards - The array of cards to save.
   * @returns {Promise<void>} A promise that resolves when saving is complete.
   */
  public save(cards: Card[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.stringify(cards);
        localStorage.setItem(LOCAL_STORAGE_KEY, data);
        resolve();
      } catch (error) {
        console.error('Failed to save cards to localStorage:', error);
        reject(new Error('Could not save cards. Private browsing mode might be enabled.'));
      }
    });
  }

  /**
   * Loads cards from localStorage and migrates them if needed.
   * @returns {Promise<Card[]>} A promise that resolves with the array of cards.
   */
  public load(): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
          const cards = JSON.parse(data) as Card[];
          // Migrate old cards to include new fields
          const migratedCards = cards.map(card => ({
            ...card,
            isFavorite: card.isFavorite ?? false,
            folderId: card.folderId ?? undefined
          }));
          resolve(migratedCards);
        } else {
          resolve([]);
        }
      } catch (error) {
        console.error('Failed to load cards from localStorage:', error);
        reject(new Error('Could not load cards from storage.'));
      }
    });
  }

  /**
   * Saves an array of folders to localStorage.
   * @param {Folder[]} folders - The array of folders to save.
   * @returns {Promise<void>} A promise that resolves when saving is complete.
   */
  public saveFolders(folders: Folder[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.stringify(folders);
        localStorage.setItem(FOLDERS_STORAGE_KEY, data);
        resolve();
      } catch (error) {
        console.error('Failed to save folders to localStorage:', error);
        reject(new Error('Could not save folders. Private browsing mode might be enabled.'));
      }
    });
  }

  /**
   * Loads folders from localStorage.
   * @returns {Promise<Folder[]>} A promise that resolves with the array of folders.
   */
  public loadFolders(): Promise<Folder[]> {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem(FOLDERS_STORAGE_KEY);
        if (data) {
          resolve(JSON.parse(data) as Folder[]);
        } else {
          resolve([]);
        }
      } catch (error) {
        console.error('Failed to load folders from localStorage:', error);
        reject(new Error('Could not load folders from storage.'));
      }
    });
  }
}

export const storageService = new StorageService();
