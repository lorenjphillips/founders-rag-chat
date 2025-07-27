import { qdrantService, type SearchResult, type RAGResponse } from './qdrant';

export class RAGService {
  async search(query: string, limit: number = 5): Promise<RAGResponse> {
    try {
      const searchResults = await qdrantService.searchSimilar(query, limit);

      if (searchResults.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the Founders Podcast transcripts for your question.",
          sources: [],
          query
        };
      }

      const context = searchResults
        .map(result => result.payload.chunk_text)
        .join('\n\n');

      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();

      return {
        answer: data.answer,
        sources: searchResults,
        query
      };

    } catch (error) {
      console.error('RAG Service Error:', error);
      return {
        answer: "Sorry, I encountered an error while processing your request. Please try again.",
        sources: [],
        query
      };
    }
  }

  async getSystemStats() {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch system stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get system stats:', error);
      return {
        totalVectors: 0,
        collectionStatus: 'unknown'
      };
    }
  }
}

// Export the singleton instance
export const ragService = new RAGService();