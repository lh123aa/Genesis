# Decisions

Record architectural choices and rationales here.
## TypeScript Configuration
- Root tsconfig.json configured with composite: true for project references.
- Base settings: ESNext, strict mode, source maps enabled.

## Infrastructure Components
- **Redis**: Chosen for caching and session management due to its performance and simplicity.
- **Weaviate**: Selected as the Vector Database for its robust GraphQL API and support for various vectorization modules.
- **Anonymous Access**: Enabled for Weaviate in development to streamline the initial integration process.
## Memory Client Architecture
- Chose singleton pattern for Redis and Weaviate clients to avoid multiple connections.
-  provides a high-level API for common operations (state, embeddings).
## Memory Client Architecture
- Chose singleton pattern for Redis and Weaviate clients to avoid multiple connections.
- MemoryManager provides a high-level API for common operations (state, embeddings).
