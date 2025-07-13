import { QdrantClient } from '@qdrant/js-client-rest';

export interface SearchResult {
  id: string;
  score: number;
  payload: {
    episode_title: string;
    episode_number: number;
    main_subject: string;
    subject_details: string;
    url: string;
    filename: string;
    chunk_text: string;
    chunk_index: number;
    chunk_tokens: number;
  };
}

export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  query: string;
}

class QdrantService {
  private client: QdrantClient;
  private collectionName = 'founders_transcripts';

  constructor() {
    const qdrantUrl = import.meta.env.VITE_QDRANT_URL || 'http://localhost:6333';
    this.client = new QdrantClient({ url: qdrantUrl });
  }

  async searchSimilar(
    queryEmbedding: number[], 
    limit: number = 5
  ): Promise<SearchResult[]> {
    try {
      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit,
        with_payload: true,
        score_threshold: 0.3 // Lower threshold for better recall
      });

      return searchResult.map(result => ({
        id: result.id as string,
        score: result.score || 0,
        payload: result.payload as SearchResult['payload']
      }));
    } catch (error) {
      console.error('Qdrant search error:', error);
      throw new Error('Failed to search vector database');
    }
  }

  async getCollectionInfo() {
    return await this.client.getCollection(this.collectionName);
  }
}

export const qdrantService = new QdrantService();