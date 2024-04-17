import {QdrantClient} from '@qdrant/js-client-rest';

export class QuadrantClient {
  private qdrant: QdrantClient;

  constructor(url: string) {
    this.qdrant = new QdrantClient({url: url});
  }

  async findCollection(collectionName: string): Promise<{name: string} | undefined> {
    const result = await this.qdrant.getCollections();
    return result.collections.find(collection => collection.name === collectionName);
  }

  async tryCreateCollection(collectionName: string): Promise<{name: string} | undefined> {
    try {
      let collection = await this.findCollection(collectionName);
      if (!collection) {
        await this.qdrant.createCollection(collectionName, {
          vectors: {size: 1536, distance: 'Cosine', on_disk: true},
        });

        collection = await this.findCollection(collectionName);
      }

      return collection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  async upsertBatch(collectionName: string, data: any[]) {
    await this.qdrant.upsert(collectionName, {
      wait: true,
      batch: {
        ids: data.map(point => point.id),
        vectors: data.map(point => point.vector),
        payloads: data.map(point => point.payload),
      },
    });
  }

  async searchCollection(collectionName: string, queryEmbedding: number[], limit: number) {
    return this.qdrant.search(collectionName, {
      vector: queryEmbedding,
      limit: limit,
      filter: {
        must: [
          {
            key: 'source',
            match: {
              value: collectionName,
            },
          },
        ],
      },
    });
  }
}
