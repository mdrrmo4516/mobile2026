// IndexedDB manager for offline incident queue

const DB_NAME = 'MDRRMOOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'incidents';

class OfflineQueueManager {
  constructor() {
    this.db = null;
    this.listeners = [];
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[OfflineQueue] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineQueue] Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          
          // Create indexes
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('synced', 'synced', { unique: false });
          
          console.log('[OfflineQueue] Object store created');
        }
      };
    });
  }

  // Add incident to queue
  async addIncident(incidentData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      const incident = {
        data: incidentData,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      const request = objectStore.add(incident);

      request.onsuccess = () => {
        console.log('[OfflineQueue] Incident added to queue:', request.result);
        this.notifyListeners();
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[OfflineQueue] Failed to add incident:', request.error);
        reject(request.error);
      };
    });
  }

  // Get all queued incidents
  async getQueuedIncidents() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const incidents = request.result.filter(incident => !incident.synced);
        resolve(incidents);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get count of queued incidents
  async getQueueCount() {
    const incidents = await this.getQueuedIncidents();
    return incidents.length;
  }

  // Mark incident as synced
  async markAsSynced(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const getRequest = objectStore.get(id);

      getRequest.onsuccess = () => {
        const incident = getRequest.result;
        if (incident) {
          incident.synced = true;
          const updateRequest = objectStore.put(incident);
          
          updateRequest.onsuccess = () => {
            console.log('[OfflineQueue] Incident marked as synced:', id);
            this.notifyListeners();
            resolve();
          };
          
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Incident not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Delete synced incidents
  async deleteSyncedIncidents() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('synced');
      const request = index.openCursor(IDBKeyRange.only(true));

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          objectStore.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          console.log('[OfflineQueue] Synced incidents deleted');
          this.notifyListeners();
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Sync all queued incidents
  async syncAll() {
    const incidents = await this.getQueuedIncidents();
    console.log('[OfflineQueue] Syncing', incidents.length, 'incidents');

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const incident of incidents) {
      try {
        // Try to send incident to server
        const response = await fetch('/api/incidents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incident.data),
        });

        if (response.ok) {
          await this.markAsSynced(incident.id);
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            id: incident.id,
            error: `Server responded with ${response.status}`,
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          id: incident.id,
          error: error.message,
        });
      }
    }

    // Clean up synced incidents
    if (results.success > 0) {
      await this.deleteSyncedIncidents();
    }

    return results;
  }

  // Add listener for queue changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.getQueueCount().then(count => {
      this.listeners.forEach(callback => callback(count));
    });
  }

  // Clear all data (for testing)
  async clearAll() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('[OfflineQueue] All data cleared');
        this.notifyListeners();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
const offlineQueue = new OfflineQueueManager();
export default offlineQueue;
