
import { Card } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

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
   * Loads cards from localStorage.
   * @returns {Promise<Card[]>} A promise that resolves with the array of cards.
   */
  public load(): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
          resolve(JSON.parse(data) as Card[]);
        } else {
          resolve([]);
        }
      } catch (error) {
        console.error('Failed to load cards from localStorage:', error);
        reject(new Error('Could not load cards from storage.'));
      }
    });
  }
}

export const storageService = new StorageService();
