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

  async searchSimilar(queryText: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const embeddingResponse = await fetch('/api/embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: queryText }),
      });

      if (!embeddingResponse.ok) {
        throw new Error('Failed to generate embedding');
      }

      const { embedding } = await embeddingResponse.json();

      const searchResponse = await this.client.search(this.collectionName, {
        vector: embedding,
        limit,
        with_payload: true,
      });

      return searchResponse.map(result => ({
        id: String(result.id),
        score: result.score || 0,
        payload: result.payload as SearchResult['payload'],
      }));

    } catch (error) {
      console.error('Qdrant search error:', error);
      return [];
    }
  }
}

export const qdrantService = new QdrantService();