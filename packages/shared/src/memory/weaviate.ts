import weaviate, { WeaviateClient } from 'weaviate-ts-client';

const WEAVIATE_URL = process.env.WEAVIATE_URL || 'http://localhost:8080';

let client: WeaviateClient | null = null;

export const getWeaviateClient = (): WeaviateClient => {
  if (!client) {
    const url = new URL(WEAVIATE_URL);
    client = weaviate.client({
      scheme: url.protocol.replace(':', ''),
      host: url.host,
    });
  }
  return client;
};

export default getWeaviateClient;
