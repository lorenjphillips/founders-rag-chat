import { generateEmbedding, generateRAGResponse } from './openai';
import { qdrantService, type SearchResult, type RAGResponse } from './qdrant';

export class RAGService {
  async search(query: string, limit: number = 5): Promise<RAGResponse> {
    try {
      // Generate embedding for the query
      const { embedding } = await generateEmbedding(query);

      // Search for similar chunks in Qdrant
      const searchResults = await qdrantService.searchSimilar(embedding, limit);

      if (searchResults.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the Founders Podcast transcripts for your question.",
          sources: [],
          query
        };
      }

      // Combine the context from search results
      const context = searchResults
        .map(result => result.payload.chunk_text)
        .join('\n\n');

      // Generate response using GPT
      const answer = await generateRAGResponse(query, context);

      return {
        answer,
        sources: searchResults,
        query
      };
    } catch (error) {
      console.error('RAG Service error:', error);
      throw new Error('Failed to process search request');
    }
  }

  async getSystemStats() {
    try {
      const collectionInfo = await qdrantService.getCollectionInfo();
      return {
        totalVectors: collectionInfo.vectors_count,
        collectionStatus: collectionInfo.status
      };
    } catch (error) {
      console.error('Failed to get system stats:', error);
      return null;
    }
  }
}

export const ragService = new RAGService();