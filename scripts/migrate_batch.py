import os
import sys
from qdrant_client import QdrantClient
from dotenv import load_dotenv
from tqdm import tqdm
import time

# Load environment variables
load_dotenv()

def migrate_in_batches():
    """Migrate collection from local to production Qdrant in small batches"""
    
    # Initialize clients
    local_url = os.getenv('QDRANT_URL_LOCAL')
    prod_url = os.getenv('QDRANT_URL_PRODUCTION')
    
    print(f"Migrating from: {local_url}")
    print(f"Migrating to: {prod_url}")
    
    local_client = QdrantClient(url=local_url, check_compatibility=False)
    prod_client = QdrantClient(url=prod_url, check_compatibility=False)
    
    collection_name = "founders_transcripts"
    
    # Get total points count
    try:
        collection_info = local_client.get_collection(collection_name)
        total_points = collection_info.points_count
        print(f"Total points to migrate: {total_points}")
    except Exception as e:
        print(f"Error getting collection info: {e}")
        return
    
    # Migrate points in small batches
    batch_size = 50  # Smaller batches for reliability
    offset = None
    migrated = 0
    
    with tqdm(total=total_points, desc="Migrating points") as pbar:
        while True:
            try:
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
                
                # Upload to production with retry
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        prod_client.upload_points(
                            collection_name=collection_name,
                            points=points
                        )
                        break
                    except Exception as e:
                        if attempt == max_retries - 1:
                            print(f"Failed to upload batch after {max_retries} attempts: {e}")
                            return
                        print(f"Retry {attempt + 1}/{max_retries} for batch...")
                        time.sleep(2)
                
                migrated += len(points)
                pbar.update(len(points))
                
                # Small delay between batches
                time.sleep(0.5)
                
                if offset is None:
                    break
                    
            except Exception as e:
                print(f"Error during migration: {e}")
                break
    
    print(f"\n✅ Successfully migrated {migrated} points to production!")
    
    # Verify migration
    try:
        prod_info = prod_client.get_collection(collection_name)
        print(f"Production collection now has {prod_info.points_count} points")
    except Exception as e:
        print(f"Error verifying migration: {e}")

if __name__ == "__main__":
    migrate_in_batches()