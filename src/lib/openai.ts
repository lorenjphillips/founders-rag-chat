import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, move to backend
});

export interface EmbeddingResponse {
  embedding: number[];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export async function generateEmbedding(text: string): Promise<EmbeddingResponse> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return {
      embedding: response.data[0].embedding,
      usage: response.usage
    };
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateRAGResponse(
  query: string, 
  context: string
): Promise<string> {
  try {
    const prompt = `You are a helpful assistant that answers questions about founders and entrepreneurship based on the Founders Podcast. 

Use the following context from podcast transcripts to answer the user's question. If the context doesn't contain enough information to answer the question, say so honestly.

Context:
${context}

Question: ${query}

Answer:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert on entrepreneurship and business history, with deep knowledge from the Founders Podcast.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content || 'No response generated';
  } catch (error) {
    console.error('OpenAI chat error:', error);
    throw new Error('Failed to generate response');
  }
}