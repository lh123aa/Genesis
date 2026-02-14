/**
 * Knowledge Base
 * 
 * Stores and manages accumulated knowledge from executions.
 * Best practices, common pitfalls, optimization strategies.
 */

export interface KnowledgeEntry {
  id: string;
  category: 'best_practice' | 'pitfall' | 'pattern' | 'optimization' | 'insight';
  domain?: string;
  title: string;
  content: string;
  examples?: string[];
  relatedEntries?: string[];
  source: {
    type: 'execution' | 'learning' | 'manual';
    reference: string;
  };
  createdAt: string;
  updatedAt: string;
  usage: {
    applied: number;
    helpful: number;
  };
  tags: string[];
}

export interface KnowledgeQuery {
  category?: KnowledgeEntry['category'];
  domain?: string;
  tags?: string[];
  search?: string;
  limit?: number;
}

/**
 * Knowledge Base class
 */
export class KnowledgeBase {
  private entries: Map<string, KnowledgeEntry> = new Map();
  private tagIndex: Map<string, string[]> = new Map();
  private categoryIndex: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDefaultKnowledge();
  }

  /**
   * Initialize with default knowledge
   */
  private initializeDefaultKnowledge(): void {
    const defaultEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'usage'>[] = [
      // Web Scraping
      {
        category: 'best_practice',
        domain: 'web_scraping',
        title: 'Respect Rate Limits',
        content: 'Always add delays between requests. Use exponential backoff for retries.',
        examples: ['Add 1-2 second delay between requests', 'Implement 429 response handling'],
        source: { type: 'manual', reference: 'best_practices' },
        tags: ['web_scraping', 'performance', 'respectful'],
      },
      {
        category: 'pitfall',
        domain: 'web_scraping',
        title: 'Dynamic Content Without JavaScript',
        content: 'Many modern sites load content via JavaScript. Using simple HTTP requests will miss this content.',
        examples: ['SPAs (Single Page Applications)', 'Infinite scroll pages', 'AJAX-loaded content'],
        source: { type: 'manual', reference: 'common_issues' },
        tags: ['web_scraping', 'javascript', 'dynamic'],
      },
      {
        category: 'best_practice',
        domain: 'web_scraping',
        title: 'User Agent Rotation',
        content: 'Rotate User-Agent strings to avoid being blocked.',
        examples: ['Use realistic browser UA strings', 'Rotate from a pool of 10+ agents'],
        source: { type: 'manual', reference: 'best_practices' },
        tags: ['web_scraping', 'stealth', 'avoid_blocking'],
      },

      // Development
      {
        category: 'best_practice',
        domain: 'development',
        title: 'Test-Driven Development',
        content: 'Write tests before or alongside implementation code.',
        examples: ['Write unit tests for each function', 'Use red-green-refactor cycle'],
        source: { type: 'manual', reference: 'best_practices' },
        tags: ['development', 'testing', 'tdd'],
      },
      {
        category: 'pitfall',
        domain: 'development',
        title: 'No Error Handling',
        content: 'Failing to handle edge cases and errors leads to brittle code.',
        examples: ['Missing null checks', 'No try-catch blocks', 'Ignoring Promise rejections'],
        source: { type: 'manual', reference: 'common_issues' },
        tags: ['development', 'error_handling', 'robustness'],
      },

      // Debugging
      {
        category: 'best_practice',
        domain: 'debugging',
        title: 'Reproduce Before Fix',
        content: 'Always reproduce the bug consistently before attempting a fix.',
        examples: ['Create minimal reproduction case', 'Document exact steps to trigger'],
        source: { type: 'manual', reference: 'best_practices' },
        tags: ['debugging', 'methodology'],
      },
      {
        category: 'pattern',
        domain: 'debugging',
        title: 'Binary Search Debugging',
        content: 'When debugging large codebases, use binary search approach to isolate the issue.',
        examples: ['Comment out half the code', 'Check if issue persists', 'Narrow down section'],
        source: { type: 'manual', reference: 'patterns' },
        tags: ['debugging', 'strategy', 'efficiency'],
      },

      // Documentation
      {
        category: 'best_practice',
        domain: 'documentation',
        title: 'Audience-First Writing',
        content: 'Write for your target audience. API docs for developers, guides for users.',
        examples: ['Include code examples for APIs', 'Use screenshots for UI guides'],
        source: { type: 'manual', reference: 'best_practices' },
        tags: ['documentation', 'writing', 'audience'],
      },

      // General
      {
        category: 'insight',
        title: '80/20 Rule',
        content: '80% of effects come from 20% of causes. Focus on high-impact areas first.',
        examples: ['Optimize the most-used functions', 'Fix the most frequent bugs first'],
        source: { type: 'manual', reference: 'principles' },
        tags: ['general', 'efficiency', 'prioritization'],
      },
      {
        category: 'best_practice',
        title: 'Version Control Everything',
        content: 'Keep all code, configs, and documentation in version control.',
        examples: ['Use Git for all projects', 'Commit early and often'],
        source: { type: 'manual', reference: 'best_practices' },
        tags: ['general', 'git', 'version_control'],
      },
    ];

    for (const entry of defaultEntries) {
      this.addEntry(entry);
    }
  }

  /**
   * Add a knowledge entry
   */
  addEntry(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'usage'>): string {
    const id = `kb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const fullEntry: KnowledgeEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
      usage: { applied: 0, helpful: 0 },
    };

    this.entries.set(id, fullEntry);

    // Index by tags
    for (const tag of entry.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, []);
      }
      this.tagIndex.get(tag)!.push(id);
    }

    // Index by category
    if (!this.categoryIndex.has(entry.category)) {
      this.categoryIndex.set(entry.category, []);
    }
    this.categoryIndex.get(entry.category)!.push(id);

    return id;
  }

  /**
   * Get entry by ID
   */
  getEntry(id: string): KnowledgeEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Query knowledge base
   */
  query(query: KnowledgeQuery): KnowledgeEntry[] {
    let results = Array.from(this.entries.values());

    // Filter by category
    if (query.category) {
      const ids = this.categoryIndex.get(query.category) || [];
      results = results.filter(e => ids.includes(e.id));
    }

    // Filter by domain
    if (query.domain) {
      results = results.filter(e => e.domain === query.domain);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(e => 
        query.tags!.some(tag => e.tags.includes(tag))
      );
    }

    // Search in title and content
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(e => 
        e.title.toLowerCase().includes(searchLower) ||
        e.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort by usage (most helpful first)
    results.sort((a, b) => b.usage.helpful - a.usage.helpful);

    // Limit results
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get entries by category
   */
  getByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
    const ids = this.categoryIndex.get(category) || [];
    return ids.map(id => this.entries.get(id)).filter((e): e is KnowledgeEntry => !!e);
  }

  /**
   * Get entries by domain
   */
  getByDomain(domain: string): KnowledgeEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.domain === domain);
  }

  /**
   * Get entries by tag
   */
  getByTag(tag: string): KnowledgeEntry[] {
    const ids = this.tagIndex.get(tag) || [];
    return ids.map(id => this.entries.get(id)).filter((e): e is KnowledgeEntry => !!e);
  }

  /**
   * Search knowledge base
   */
  search(keywords: string[]): KnowledgeEntry[] {
    const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
    
    const scored: { entry: KnowledgeEntry; score: number }[] = [];

    for (const entry of this.entries.values()) {
      let score = 0;

      // Check title
      const titleWords = entry.title.toLowerCase().split(' ');
      for (const word of titleWords) {
        if (keywordSet.has(word)) score += 3;
      }

      // Check content
      const contentWords = entry.content.toLowerCase().split(' ');
      for (const word of contentWords) {
        if (keywordSet.has(word)) score += 1;
      }

      // Check tags
      for (const tag of entry.tags) {
        if (keywordSet.has(tag.toLowerCase())) score += 2;
      }

      if (score > 0) {
        scored.push({ entry, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.entry);
  }

  /**
   * Mark entry as applied
   */
  markApplied(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.usage.applied++;
      entry.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Mark entry as helpful
   */
  markHelpful(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.usage.helpful++;
      entry.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Get most helpful entries
   */
  getMostHelpful(limit: number = 10): KnowledgeEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.usage.helpful - a.usage.helpful)
      .slice(0, limit);
  }

  /**
   * Get most applied entries
   */
  getMostApplied(limit: number = 10): KnowledgeEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.usage.applied - a.usage.applied)
      .slice(0, limit);
  }

  /**
   * Get related entries
   */
  getRelated(id: string): KnowledgeEntry[] {
    const entry = this.entries.get(id);
    if (!entry || !entry.relatedEntries) return [];

    return entry.relatedEntries
      .map(rid => this.entries.get(rid))
      .filter((e): e is KnowledgeEntry => !!e);
  }

  /**
   * Add relationship between entries
   */
  addRelationship(id1: string, id2: string): void {
    const entry1 = this.entries.get(id1);
    const entry2 = this.entries.get(id2);

    if (entry1 && entry2) {
      if (!entry1.relatedEntries) entry1.relatedEntries = [];
      if (!entry2.relatedEntries) entry2.relatedEntries = [];

      if (!entry1.relatedEntries.includes(id2)) {
        entry1.relatedEntries.push(id2);
      }
      if (!entry2.relatedEntries.includes(id1)) {
        entry2.relatedEntries.push(id1);
      }
    }
  }

  /**
   * Update entry
   */
  updateEntry(id: string, updates: Partial<KnowledgeEntry>): void {
    const entry = this.entries.get(id);
    if (entry) {
      Object.assign(entry, updates);
      entry.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Delete entry
   */
  deleteEntry(id: string): boolean {
    return this.entries.delete(id);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalEntries: number;
    byCategory: Record<string, number>;
    byDomain: Record<string, number>;
    totalTags: number;
    mostUsed: KnowledgeEntry[];
  } {
    const entries = Array.from(this.entries.values());
    
    const byCategory: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    const allTags = new Set<string>();

    for (const entry of entries) {
      byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
      
      if (entry.domain) {
        byDomain[entry.domain] = (byDomain[entry.domain] || 0) + 1;
      }

      for (const tag of entry.tags) {
        allTags.add(tag);
      }
    }

    return {
      totalEntries: entries.length,
      byCategory,
      byDomain,
      totalTags: allTags.size,
      mostUsed: this.getMostApplied(5),
    };
  }

  /**
   * Export knowledge base
   */
  export(): string {
    return JSON.stringify(Array.from(this.entries.values()), null, 2);
  }

  /**
   * Import knowledge base
   */
  import(json: string): void {
    const entries: KnowledgeEntry[] = JSON.parse(json);
    for (const entry of entries) {
      this.entries.set(entry.id, entry);
      
      // Rebuild indexes
      for (const tag of entry.tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, []);
        }
        if (!this.tagIndex.get(tag)!.includes(entry.id)) {
          this.tagIndex.get(tag)!.push(entry.id);
        }
      }

      if (!this.categoryIndex.has(entry.category)) {
        this.categoryIndex.set(entry.category, []);
      }
      if (!this.categoryIndex.get(entry.category)!.includes(entry.id)) {
        this.categoryIndex.get(entry.category)!.push(entry.id);
      }
    }
  }

  /**
   * Get recommendations for a task
   */
  getRecommendations(domain: string, taskType?: string): KnowledgeEntry[] {
    const recommendations: KnowledgeEntry[] = [];

    // Get domain-specific entries
    const domainEntries = this.getByDomain(domain);
    recommendations.push(...domainEntries.filter(e => e.category === 'best_practice'));

    // Get relevant pitfalls
    recommendations.push(...domainEntries.filter(e => e.category === 'pitfall'));

    // Get general insights
    const insights = this.getByCategory('insight');
    recommendations.push(...insights.slice(0, 2));

    return recommendations;
  }
}

// Singleton instance
export const knowledgeBase = new KnowledgeBase();
