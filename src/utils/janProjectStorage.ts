// Jan's Project Templates & Context Library
// Permanent storage for recurring content types and reference materials

interface ContentTemplate {
  id: string;
  name: string;
  character: string; // Anica, Caelum, Aurion
  brandVoice: string;
  templateType: string;
  description: string;
  structure: string; // Format/outline
  guidelines: string[]; // Key points to remember
  examples: string[]; // Past successful content IDs
  frequency: 'weekly' | 'monthly' | 'as-needed' | 'custom';
  lastUsed: string;
  timesUsed: number;
  createdAt: string;
  tags: string[];
}

interface ProjectReference {
  id: string;
  templateId: string;
  title: string;
  content: string;
  character: string;
  createdAt: string;
  performance?: {
    engagement?: string;
    notes?: string;
  };
  tags: string[];
}

const DB_NAME = 'JanProjectLibrary';
const DB_VERSION = 1;
const TEMPLATES_STORE = 'contentTemplates';
const REFERENCES_STORE = 'projectReferences';

class JanProjectStorage {
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

        // Content Templates Store (permanent)
        if (!db.objectStoreNames.contains(TEMPLATES_STORE)) {
          const templateStore = db.createObjectStore(TEMPLATES_STORE, { keyPath: 'id' });
          templateStore.createIndex('character', 'character', { unique: false });
          templateStore.createIndex('name', 'name', { unique: false });
          templateStore.createIndex('lastUsed', 'lastUsed', { unique: false });
        }

        // Project References Store (examples library)
        if (!db.objectStoreNames.contains(REFERENCES_STORE)) {
          const refStore = db.createObjectStore(REFERENCES_STORE, { keyPath: 'id' });
          refStore.createIndex('templateId', 'templateId', { unique: false });
          refStore.createIndex('createdAt', 'createdAt', { unique: false });
          refStore.createIndex('character', 'character', { unique: false });
        }
      };
    });
  }

  // ============ TEMPLATES ============

  async saveTemplate(template: ContentTemplate): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TEMPLATES_STORE], 'readwrite');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const request = store.put(template);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTemplate(id: string): Promise<ContentTemplate | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TEMPLATES_STORE], 'readonly');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTemplates(): Promise<ContentTemplate[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TEMPLATES_STORE], 'readonly');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as ContentTemplate[]);
      request.onerror = () => reject(request.error);
    });
  }

  async getTemplatesByCharacter(character: string): Promise<ContentTemplate[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TEMPLATES_STORE], 'readonly');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const index = store.index('character');
      const request = index.getAll(character);

      request.onsuccess = () => resolve(request.result as ContentTemplate[]);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTemplateUsage(templateId: string): Promise<void> {
    const template = await this.getTemplate(templateId);
    if (template) {
      template.lastUsed = new Date().toISOString();
      template.timesUsed += 1;
      await this.saveTemplate(template);
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TEMPLATES_STORE], 'readwrite');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============ PROJECT REFERENCES ============

  async saveReference(reference: ProjectReference): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([REFERENCES_STORE], 'readwrite');
      const store = transaction.objectStore(REFERENCES_STORE);
      const request = store.put(reference);

      request.onsuccess = () => {
        // Update template's examples list
        this.addExampleToTemplate(reference.templateId, reference.id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getReference(id: string): Promise<ProjectReference | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([REFERENCES_STORE], 'readonly');
      const store = transaction.objectStore(REFERENCES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getReferencesByTemplate(templateId: string, limit: number = 5): Promise<ProjectReference[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([REFERENCES_STORE], 'readonly');
      const store = transaction.objectStore(REFERENCES_STORE);
      const index = store.index('templateId');
      const request = index.getAll(templateId);

      request.onsuccess = () => {
        const results = request.result as ProjectReference[];
        // Return most recent examples
        resolve(results.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, limit));
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async addExampleToTemplate(templateId: string, referenceId: string): Promise<void> {
    const template = await this.getTemplate(templateId);
    if (template) {
      if (!template.examples.includes(referenceId)) {
        template.examples.push(referenceId);
        // Keep only last 10 examples
        if (template.examples.length > 10) {
          template.examples = template.examples.slice(-10);
        }
        await this.saveTemplate(template);
      }
    }
  }

  // ============ CONTEXT RETRIEVAL FOR JAN ============

  async getContextForTemplate(templateId: string): Promise<{
    template: ContentTemplate;
    recentExamples: ProjectReference[];
    summary: string;
  } | null> {
    const template = await this.getTemplate(templateId);
    if (!template) return null;

    const recentExamples = await this.getReferencesByTemplate(templateId, 3);

    // Build context summary for Jan
    const summary = `
📋 Template: ${template.name}
👤 Character: ${template.character}
🎯 Type: ${template.templateType}
📝 Used ${template.timesUsed} times (last: ${new Date(template.lastUsed).toLocaleDateString()})

Structure:
${template.structure}

Guidelines:
${template.guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Recent Examples (${recentExamples.length}):
${recentExamples.map((ex, i) => `${i + 1}. "${ex.title}" (${new Date(ex.createdAt).toLocaleDateString()})`).join('\n')}
    `.trim();

    return { template, recentExamples, summary };
  }

  // ============ SEARCH & DISCOVERY ============

  async searchTemplates(query: string): Promise<ContentTemplate[]> {
    const allTemplates = await this.getAllTemplates();
    const lowerQuery = query.toLowerCase();

    return allTemplates.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getRecentlyUsedTemplates(limit: number = 5): Promise<ContentTemplate[]> {
    const allTemplates = await this.getAllTemplates();
    return allTemplates
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, limit);
  }

  // ============ EXPORT & BACKUP ============

  async exportAllData(): Promise<string> {
    const templates = await this.getAllTemplates();
    const references: ProjectReference[] = [];

    for (const template of templates) {
      const refs = await this.getReferencesByTemplate(template.id, 100);
      references.push(...refs);
    }

    return JSON.stringify({
      templates,
      references,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    for (const template of data.templates) {
      await this.saveTemplate(template);
    }
    
    for (const reference of data.references) {
      await this.saveReference(reference);
    }
  }
}

// Export singleton
export const janProjectStorage = new JanProjectStorage();

// Initialize
export const initJanProjectStorage = async () => {
  try {
    await janProjectStorage.init();
    console.log('✅ Jan Project Storage initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Jan Project Storage:', error);
  }
};

export type { ContentTemplate, ProjectReference };
