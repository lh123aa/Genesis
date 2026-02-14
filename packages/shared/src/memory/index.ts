import { getRedisClient } from './redis';
import { getWeaviateClient } from './weaviate';

export class MemoryManager {
  private redis = getRedisClient();
  private weaviate = getWeaviateClient();

  async setState(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.redis.set(key, stringValue);
  }

  async getState(key: string): Promise<any> {
    const value = await this.redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async saveEmbedding(collection: string, data: any): Promise<void> {
    await this.weaviate.data
      .creator()
      .withClassName(collection)
      .withProperties(data)
      .do();
  }

  async searchEmbedding(collection: string, query: string): Promise<any[]> {
    const result = await this.weaviate.graphql
      .get()
      .withClassName(collection)
      .withFields('text _additional { distance }')
      .withNearText({ concepts: [query] })
      .do();
    
    return result.data.Get[collection];
  }
}

export const memoryManager = new MemoryManager();
export { getRedisClient } from './redis';
export { getWeaviateClient } from './weaviate';
