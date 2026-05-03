/**
 * Offline Storage System
 * Provides auto-save functionality and offline data persistence using IndexedDB
 */

import { openDB } from 'idb';

// Database configuration
const DB_NAME = 'training-program-db';
const DB_VERSION = 1;
const STORES = {
  sessions: 'sessions',
  progress: 'progress',
  settings: 'settings',
  offlineQueue: 'offline-queue'
};

// Initialize database
export const initDatabase = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains(STORES.sessions)) {
          const sessionStore = db.createObjectStore(STORES.sessions, { keyPath: 'id' });
          sessionStore.createIndex('timestamp', 'timestamp');
          sessionStore.createIndex('workoutKey', 'workoutKey');
        }

        if (!db.objectStoreNames.contains(STORES.progress)) {
          const progressStore = db.createObjectStore(STORES.progress, { keyPath: 'id' });
          progressStore.createIndex('exerciseName', 'exerciseName');
          progressStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains(STORES.settings)) {
          db.createObjectStore(STORES.settings, { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains(STORES.offlineQueue)) {
          const queueStore = db.createObjectStore(STORES.offlineQueue, { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp');
          queueStore.createIndex('type', 'type');
        }
      }
    });

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Session storage operations
export const sessionStorage = {
  // Save session with auto-increment ID
  save: async (sessionData) => {
    try {
      const db = await initDatabase();
      const timestamp = new Date().toISOString();
      
      const session = {
        ...sessionData,
        timestamp,
        lastModified: timestamp,
        synced: false
      };

      // If no ID exists, generate one
      if (!session.id) {
        session.id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      await db.put(STORES.sessions, session);
      
      // Add to offline queue for sync
      await addToOfflineQueue('session', session.id, session);
      
      return session.id;
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  },

  // Get session by ID
  get: async (sessionId) => {
    try {
      const db = await initDatabase();
      return await db.get(STORES.sessions, sessionId);
    } catch (error) {
      console.error('Failed to get session:', error);
      throw error;
    }
  },

  // Get all sessions
  getAll: async () => {
    try {
      const db = await initDatabase();
      return await db.getAll(STORES.sessions);
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      throw error;
    }
  },

  // Update session
  update: async (sessionId, updates) => {
    try {
      const db = await initDatabase();
      const existing = await db.get(STORES.sessions, sessionId);
      
      if (!existing) {
        throw new Error('Session not found');
      }

      const updated = {
        ...existing,
        ...updates,
        lastModified: new Date().toISOString()
      };

      await db.put(STORES.sessions, updated);
      await addToOfflineQueue('session', sessionId, updated);
      
      return updated;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  },

  // Delete session
  delete: async (sessionId) => {
    try {
      const db = await initDatabase();
      await db.delete(STORES.sessions, sessionId);
      
      // Remove from offline queue
      await removeFromOfflineQueue('session', sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }
};

// Progress storage operations
export const progressStorage = {
  save: async (progressData) => {
    try {
      const db = await initDatabase();
      const timestamp = new Date().toISOString();
      
      const progress = {
        ...progressData,
        timestamp,
        id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      await db.put(STORES.progress, progress);
      await addToOfflineQueue('progress', progress.id, progress);
      
      return progress.id;
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  },

  get: async (progressId) => {
    try {
      const db = await initDatabase();
      return await db.get(STORES.progress, progressId);
    } catch (error) {
      console.error('Failed to get progress:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const db = await initDatabase();
      return await db.getAll(STORES.progress);
    } catch (error) {
      console.error('Failed to get all progress:', error);
      throw error;
    }
  }
};

// Settings storage operations
export const settingsStorage = {
  save: async (key, value) => {
    try {
      const db = await initDatabase();
      const setting = {
        key,
        value,
        timestamp: new Date().toISOString()
      };

      await db.put(STORES.settings, setting);
      return setting;
    } catch (error) {
      console.error('Failed to save setting:', error);
      throw error;
    }
  },

  get: async (key) => {
    try {
      const db = await initDatabase();
      const setting = await db.get(STORES.settings, key);
      return setting ? setting.value : null;
    } catch (error) {
      console.error('Failed to get setting:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const db = await initDatabase();
      const settings = await db.getAll(STORES.settings);
      return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
    } catch (error) {
      console.error('Failed to get all settings:', error);
      throw error;
    }
  }
};

// Offline queue operations
export const offlineQueue = {
  add: async (type, id, data) => {
    return await addToOfflineQueue(type, id, data);
  },

  getAll: async () => {
    try {
      const db = await initDatabase();
      return await db.getAll(STORES.offlineQueue);
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      throw error;
    }
  },

  remove: async (queueId) => {
    try {
      const db = await initDatabase();
      await db.delete(STORES.offlineQueue, queueId);
    } catch (error) {
      console.error('Failed to remove from offline queue:', error);
      throw error;
    }
  },

  clear: async () => {
    try {
      const db = await initDatabase();
      await db.clear(STORES.offlineQueue);
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
      throw error;
    }
  }
};

// Helper functions
const addToOfflineQueue = async (type, id, data) => {
  try {
    const db = await initDatabase();
    const queueItem = {
      type,
      id,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0,
      lastAttempt: null
    };

    await db.add(STORES.offlineQueue, queueItem);
    return queueItem;
  } catch (error) {
    console.error('Failed to add to offline queue:', error);
    throw error;
  }
};

const removeFromOfflineQueue = async (type, id) => {
  try {
    const db = await initDatabase();
    const queueItems = await db.getAll(STORES.offlineQueue);
    
    for (const item of queueItems) {
      if (item.type === type && item.id === id) {
        await db.delete(STORES.offlineQueue, item.id);
      }
    }
  } catch (error) {
    console.error('Failed to remove from offline queue:', error);
    throw error;
  }
};

// Auto-save manager
export class AutoSaveManager {
  constructor() {
    this.saveInterval = null;
    this.saveTimeout = null;
    this.isOnline = navigator.onLine;
    
    this.init();
  }

  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineNotification();
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.forceSave();
      }
    });

    // Listen for beforeunload to save data
    window.addEventListener('beforeunload', (e) => {
      this.forceSave();
      // Note: Modern browsers don't allow custom messages in beforeunload
    });
  }

  // Start auto-save interval
  startAutoSave(interval = 30000) { // Default 30 seconds
    this.stopAutoSave();
    
    this.saveInterval = setInterval(() => {
      this.autoSave();
    }, interval);
  }

  // Stop auto-save interval
  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  // Auto-save current session
  async autoSave() {
    try {
      // Get current session from localStorage (fallback)
      const currentSession = JSON.parse(localStorage.getItem('currentWorkoutSession') || '{}');
      
      if (Object.keys(currentSession).length > 0) {
        await sessionStorage.update(currentSession.id, currentSession);
        
        // Show subtle save indicator
        this.showSaveIndicator();
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Force save (for critical moments)
  async forceSave() {
    try {
      const currentSession = JSON.parse(localStorage.getItem('currentWorkoutSession') || '{}');
      
      if (Object.keys(currentSession).length > 0) {
        await sessionStorage.save(currentSession);
      }
    } catch (error) {
      console.error('Force save failed:', error);
    }
  }

  // Sync offline data when back online
  async syncOfflineData() {
    try {
      const queueItems = await offlineQueue.getAll();
      
      for (const item of queueItems) {
        try {
          // Here you would normally sync with your backend API
          // For now, we'll just mark as synced and remove from queue
          await offlineQueue.remove(item.id);
          
          // Update the local record to mark as synced
          if (item.type === 'session') {
            await sessionStorage.update(item.id, { synced: true });
          }
        } catch (error) {
          console.error('Failed to sync item:', item.id, error);
          
          // Increment attempt count
          item.attempts = (item.attempts || 0) + 1;
          item.lastAttempt = new Date().toISOString();
          
          // Remove from queue if too many attempts
          if (item.attempts > 5) {
            await offlineQueue.remove(item.id);
          }
        }
      }
      
      this.hideOfflineNotification();
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  // Show offline notification
  showOfflineNotification() {
    // Create or update offline notification
    let notification = document.getElementById('offline-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'offline-notification';
      notification.className = 'offline-notification';
      notification.innerHTML = `
        <div class="flex items-center gap-2 p-3 bg-yellow-500 text-white rounded-md shadow-lg">
          <span class="animate-pulse">⚠️</span>
          <span>You're offline. Changes will sync when connection is restored.</span>
        </div>
      `;
      
      document.body.appendChild(notification);
    }
  }

  // Hide offline notification
  hideOfflineNotification() {
    const notification = document.getElementById('offline-notification');
    if (notification) {
      notification.remove();
    }
  }

  // Show save indicator
  showSaveIndicator() {
    let indicator = document.getElementById('save-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'save-indicator';
      indicator.className = 'save-indicator';
      indicator.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg opacity-0 transition-opacity duration-300">
          <span class="flex items-center gap-2">
            <span class="animate-pulse">💾</span>
            Auto-saved
          </span>
        </div>
      `;
      
      document.body.appendChild(indicator);
    }

    // Show indicator
    indicator.style.opacity = '1';
    
    // Hide after 2 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }, 2000);
  }

  // Check if data is available offline
  async isDataAvailableOffline() {
    try {
      const db = await initDatabase();
      const sessions = await db.getAll(STORES.sessions);
      return sessions.length > 0;
    } catch (error) {
      console.error('Failed to check offline data:', error);
      return false;
    }
  }

  // Export data for backup
  async exportData() {
    try {
      const db = await initDatabase();
      
      const data = {
        sessions: await db.getAll(STORES.sessions),
        progress: await db.getAll(STORES.progress),
        settings: await db.getAll(STORES.settings),
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-program-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Failed to export data:', error);
      return false;
    }
  }

  // Import data from backup
  async importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const db = await initDatabase();
      
      // Import sessions
      if (data.sessions) {
        for (const session of data.sessions) {
          await db.put(STORES.sessions, session);
        }
      }
      
      // Import progress
      if (data.progress) {
        for (const progress of data.progress) {
          await db.put(STORES.progress, progress);
        }
      }
      
      // Import settings
      if (data.settings) {
        for (const setting of data.settings) {
          await db.put(STORES.settings, setting);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

// Create global instance
export const autoSaveManager = new AutoSaveManager();

// Export default
export default {
  sessionStorage,
  progressStorage,
  settingsStorage,
  offlineQueue,
  AutoSaveManager,
  autoSaveManager
};