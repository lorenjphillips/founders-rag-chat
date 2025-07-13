#!/usr/bin/env python3
"""
Qdrant collection setup script for Founders Podcast transcripts.
"""

import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv

load_dotenv()

def get_qdrant_client():
    """Initialize Qdrant client based on environment."""
    if os.getenv('NODE_ENV') == 'production':
        url = os.getenv('QDRANT_URL_PRODUCTION')
    else:
        url = os.getenv('QDRANT_URL_LOCAL', 'http://localhost:6333')
    
    print(f"Connecting to Qdrant at: {url}")
    return QdrantClient(url=url, prefer_grpc=False)

def setup_collection():
    """Create the founders_transcripts collection."""
    client = get_qdrant_client()
    
    collection_name = "founders_transcripts"
    
    # Delete existing collection if it exists
    try:
        client.delete_collection(collection_name)
        print(f"Deleted existing collection: {collection_name}")
    except Exception:
        print(f"Collection {collection_name} doesn't exist, creating new one")
    
    # Create collection with OpenAI embedding dimensions
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=1536,  # text-embedding-3-small dimension
            distance=models.Distance.COSINE
        )
    )
    
    # Create payload indexes for metadata filtering
    client.create_payload_index(
        collection_name=collection_name,
        field_name="episode_title",
        field_schema=models.PayloadSchemaType.KEYWORD
    )
    
    client.create_payload_index(
        collection_name=collection_name,
        field_name="episode_number",
        field_schema=models.PayloadSchemaType.INTEGER
    )
    
    client.create_payload_index(
        collection_name=collection_name,
        field_name="main_subject",
        field_schema=models.PayloadSchemaType.KEYWORD
    )
    
    client.create_payload_index(
        collection_name=collection_name,
        field_name="subject_details",
        field_schema=models.PayloadSchemaType.KEYWORD
    )
    
    print(f"✅ Created collection: {collection_name}")
    
    # Verify collection info
    info = client.get_collection(collection_name)
    print(f"Collection info: {info}")

if __name__ == "__main__":
    setup_collection()