import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({
  url: process.env.QDRANT_URL || 'https://qdrant-founders.onrender.com'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { embedding, limit = 5 } = req.body;
    
    if (!embedding || !Array.isArray(embedding)) {
      return res.status(400).json({ error: 'Valid embedding array is required' });
    }

    const searchResponse = await client.search('founders_transcripts', {
      vector: embedding,
      limit,
      with_payload: true,
      score_threshold: 0.3
    });

    res.status(200).json({ results: searchResponse });
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
}