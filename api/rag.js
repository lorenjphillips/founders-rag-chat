import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that answers questions based on the Founders Podcast transcripts. Use only the provided context to answer questions. If the context doesn't contain relevant information, say so. Always cite the episode titles when possible.`
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuestion: ${query}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    res.status(200).json({
      answer: response.choices[0].message.content,
      query
    });

  } catch (error) {
    console.error('RAG API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 