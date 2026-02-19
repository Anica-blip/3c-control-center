// IndexedDB Storage for Jan AI Assistant Chat Messages
// Lightweight, browser-based storage with no backend dependencies

interface ChatMessage {
  id: string;
  sender: 'user' | 'jan';
  message: string;
  timestamp: string;
  persona?: string;
  context?: {
    character?: string;
    brandVoice?: string;
    templateType?: string;
    documentTitle?: string;
  };
}

interface ChatSession {
  id: string;
  startTime: string;
  lastActivity: string;
  messages: ChatMessage[];
  metadata?: {
    totalMessages: number;
    userMessages: number;
    janMessages: number;
  };
}

const DB_NAME = 'JanAIChatDB';
const DB_VERSION = 1;
const STORE_NAME = 'chatSessions';
const MESSAGES_STORE = 'messages';

class JanChatStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create chat sessions store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const sessionStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          sessionStore.createIndex('lastActivity', 'lastActivity', { unique: false });
        }

        // Create messages store
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          const messageStore = db.createObjectStore(MESSAGES_STORE, { keyPath: 'id' });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
          messageStore.createIndex('sessionId', 'sessionId', { unique: false });
        }
      };
    });
  }

  async saveMessage(message: ChatMessage, sessionId?: string): Promise<void> {
    if (!this.db) await this.init();

    const currentSessionId = sessionId || this.getCurrentSessionId();
    const messageWithSession = { ...message, sessionId: currentSessionId };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGES_STORE], 'readwrite');
      const store = transaction.objectStore(MESSAGES_STORE);
      const request = store.add(messageWithSession);

      request.onsuccess = () => {
        this.updateSessionActivity(currentSessionId);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getMessages(sessionId?: string, limit: number = 100): Promise<ChatMessage[]> {
    if (!this.db) await this.init();

    const currentSessionId = sessionId || this.getCurrentSessionId();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGES_STORE], 'readonly');
      const store = transaction.objectStore(MESSAGES_STORE);
      const index = store.index('sessionId');
      const request = index.getAll(IDBKeyRange.only(currentSessionId));

      request.onsuccess = () => {
        const messages = request.result as ChatMessage[];
        resolve(messages.slice(-limit)); // Return last N messages
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createSession(): Promise<string> {
    if (!this.db) await this.init();

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      id: sessionId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messages: [],
      metadata: {
        totalMessages: 0,
        userMessages: 0,
        janMessages: 0
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(session);

      request.onsuccess = () => {
        localStorage.setItem('currentJanSessionId', sessionId);
        resolve(sessionId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  getCurrentSessionId(): string {
    let sessionId = localStorage.getItem('currentJanSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('currentJanSessionId', sessionId);
    }
    return sessionId;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(sessionId);

      getRequest.onsuccess = () => {
        const session = getRequest.result as ChatSession;
        if (session) {
          session.lastActivity = new Date().toISOString();
          const updateRequest = store.put(session);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAllSessions(): Promise<ChatSession[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as ChatSession[]);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOldSessions(daysToKeep: number = 30): Promise<void> {
    if (!this.db) await this.init();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffTimestamp = cutoffDate.toISOString();

    const sessions = await this.getAllSessions();
    const oldSessions = sessions.filter(s => s.lastActivity < cutoffTimestamp);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME, MESSAGES_STORE], 'readwrite');
      const sessionStore = transaction.objectStore(STORE_NAME);
      const messageStore = transaction.objectStore(MESSAGES_STORE);

      oldSessions.forEach(session => {
        sessionStore.delete(session.id);
        
        // Delete associated messages
        const index = messageStore.index('sessionId');
        const request = index.openCursor(IDBKeyRange.only(session.id));
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async exportToJSON(): Promise<string> {
    const sessions = await this.getAllSessions();
    const allMessages: any[] = [];

    for (const session of sessions) {
      const messages = await this.getMessages(session.id, 10000);
      allMessages.push({
        session: session,
        messages: messages
      });
    }

    return JSON.stringify(allMessages, null, 2);
  }

  async getStorageStats(): Promise<{ sessions: number; messages: number; estimatedSize: string }> {
    const sessions = await this.getAllSessions();
    let totalMessages = 0;

    for (const session of sessions) {
      const messages = await this.getMessages(session.id, 10000);
      totalMessages += messages.length;
    }

    // Estimate storage size
    const estimate = await navigator.storage?.estimate();
    const usedMB = estimate?.usage ? (estimate.usage / (1024 * 1024)).toFixed(2) : 'N/A';

    return {
      sessions: sessions.length,
      messages: totalMessages,
      estimatedSize: `${usedMB} MB`
    };
  }
}

// Export singleton instance
export const janChatStorage = new JanChatStorage();

// Helper function to initialize storage
export const initJanChatStorage = async () => {
  try {
    await janChatStorage.init();
    console.log('✅ Jan Chat Storage initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Jan Chat Storage:', error);
  }
};

export type { ChatMessage, ChatSession };
