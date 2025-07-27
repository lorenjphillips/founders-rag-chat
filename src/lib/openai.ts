// This file is no longer needed as we're using backend APIs
// All OpenAI calls are now handled server-side

export interface EmbeddingResponse {
  embedding: number[];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// These functions are now handled by backend APIs
export async function generateEmbedding(text: string): Promise<EmbeddingResponse> {
  throw new Error('Use backend API instead');
}

export async function generateRAGResponse(
  query: string, 
  context: string
): Promise<string> {
  throw new Error('Use backend API instead');
}