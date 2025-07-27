import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({
  url: process.env.NODE_ENV === 'production' 
    ? process.env.QDRANT_URL_PRODUCTION 
    : process.env.QDRANT_URL_LOCAL
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get collection info
    const collections = await client.getCollections();
    const foundersCollection = collections.collections.find(
      col => col.name === 'founders'
    );

    if (!foundersCollection) {
      return res.status(200).json({
        totalVectors: 0,
        collectionStatus: 'not_found'
      });
    }

    // Get collection info for more details
    const collectionInfo = await client.getCollection('founders');
    
    return res.status(200).json({
      totalVectors: collectionInfo.points_count || 0,
      collectionStatus: collectionInfo.status || 'unknown'
    });

  } catch (error) {
    console.error('Stats API Error:', error);
    return res.status(500).json({
      totalVectors: 0,
      collectionStatus: 'error'
    });
  }
} 