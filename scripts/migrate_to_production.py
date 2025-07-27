import os
import sys
from qdrant_client import QdrantClient
from dotenv import load_dotenv
from tqdm import tqdm

# Load environment variables
load_dotenv()

def migrate_collection():
    """Migrate collection from local to production Qdrant"""
    
    # Initialize clients
    local_url = os.getenv('QDRANT_URL_LOCAL')
    prod_url = os.getenv('QDRANT_URL_PRODUCTION')
    
    print(f"Migrating from: {local_url}")
    print(f"Migrating to: {prod_url}")
    
    local_client = QdrantClient(url=local_url, check_compatibility=False)
    prod_client = QdrantClient(url=prod_url, check_compatibility=False)
    
    collection_name = "founders_transcripts"
    
    # Check if collection exists in production
    try:
        prod_client.get_collection(collection_name)
        print(f"Collection {collection_name} already exists in production.")
        response = input("Do you want to delete and recreate it? (yes/no): ")
        if response.lower() != 'yes':
            print("Migration cancelled.")
            return
        prod_client.delete_collection(collection_name)
        print(f"Deleted existing collection {collection_name}")
    except:
        print(f"Collection {collection_name} doesn't exist in production, creating new one")
    
    # Get collection info from local
    local_collection = local_client.get_collection(collection_name)
    
    # Create collection in production with same config
    prod_client.create_collection(
        collection_name=collection_name,
        vectors_config=local_collection.config.params.vectors,
        on_disk_payload=True
    )
    
    print(f"Created collection {collection_name} in production")
    
    # Get total points count
    collection_info = local_client.get_collection(collection_name)
    total_points = collection_info.points_count
    print(f"Total points to migrate: {total_points}")
    
    # Migrate points in batches
    batch_size = 100
    offset = None
    migrated = 0
    
    with tqdm(total=total_points, desc="Migrating points") as pbar:
        while True:
            # Scroll through points
            points, offset = local_client.scroll(
                collection_name=collection_name,
                scroll_filter=None,
                limit=batch_size,
                offset=offset,
                with_payload=True,
                with_vectors=True
            )
            
            if not points:
                break
            
            # Upload to production
            prod_client.upload_points(
                collection_name=collection_name,
                points=points
            )
            
            migrated += len(points)
            pbar.update(len(points))
            
            if offset is None:
                break
    
    print(f"\n✅ Successfully migrated {migrated} points to production!")
    
    # Verify migration
    prod_info = prod_client.get_collection(collection_name)
    print(f"Production collection now has {prod_info.points_count} points")

if __name__ == "__main__":
    try:
        migrate_collection()
    except Exception as e:
        print(f"Error during migration: {e}")
        sys.exit(1)