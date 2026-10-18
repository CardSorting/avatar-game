import { Avatar } from '../types';

const DB_NAME = 'NanoBananaDB';
const STORE_NAME = 'avatars';
const DB_VERSION = 1;

class AvatarStorageService {
  private db: IDBDatabase | null = null;
  private connectionPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initializes or returns the existing database connection.
   * Implements a Singleton pattern to prevent multiple open connections.
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    if (!this.connectionPromise) {
      this.connectionPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error("IndexedDB is not supported in this browser."));
          return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          
          // Handle connection closing unexpectedly
          this.db.onversionchange = () => {
            this.db?.close();
            this.db = null;
            this.connectionPromise = null;
          };
          
          resolve(this.db);
        };

        request.onerror = (event) => {
          this.connectionPromise = null;
          reject(new Error(`Failed to open database: ${(event.target as IDBOpenDBRequest).error?.message}`));
        };
      });
    }

    return this.connectionPromise;
  }

  /**
   * Loads all avatars from the store.
   */
  async getAllAvatars(): Promise<Avatar[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const items = request.result as Avatar[];
          // Sort by creation date (newest first)
          items.sort((a, b) => b.createdAt - a.createdAt);
          resolve(items);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Storage Error (getAll):", error);
      return [];
    }
  }

  /**
   * Saves or updates a single avatar.
   */
  async saveAvatar(avatar: Avatar): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(avatar);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Deletes a single avatar by ID.
   */
  async deleteAvatar(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Clears the entire store.
   */
  async clearStore(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

// Export a singleton instance
export const avatarStorage = new AvatarStorageService();