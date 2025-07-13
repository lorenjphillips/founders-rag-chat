#!/usr/bin/env python3
"""
Process Founders Podcast transcripts and store embeddings in Qdrant.
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any
import openai
from qdrant_client import QdrantClient
from qdrant_client.http import models
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from tqdm import tqdm
import tiktoken
import time

load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

class TranscriptProcessor:
    def __init__(self):
        self.client = self._get_qdrant_client()
        self.collection_name = "founders_transcripts"
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  # ~1000 tokens
            chunk_overlap=200,  # 200 token overlap
            length_function=self._count_tokens,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
        )
        self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def _get_qdrant_client(self):
        """Initialize Qdrant client."""
        if os.getenv('NODE_ENV') == 'production':
            url = os.getenv('QDRANT_URL_PRODUCTION')
        else:
            url = os.getenv('QDRANT_URL_LOCAL', 'http://localhost:6333')
        return QdrantClient(url=url, prefer_grpc=False)
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken."""
        return len(self.encoding.encode(text))
    
    def _extract_metadata(self, filename: str, content: str) -> Dict[str, Any]:
        """Extract metadata from transcript filename and content."""
        # Extract episode number from filename - handles formats like "#101", "Episode 101", etc.
        episode_match = re.search(r'#?(\d+)', filename)
        episode_number = int(episode_match.group(1)) if episode_match else 0
        
        # Extract title from filename - remove episode number and file extension
        title = filename.replace('.txt', '').replace('.md', '')
        
        # Remove episode number patterns from title
        title = re.sub(r'^#?\d+\s*', '', title)
        title = re.sub(r'Episode\s*\d+\s*', '', title, flags=re.IGNORECASE)
        
        # Clean up title
        title = title.strip(' -_')
        
        # Get first 10 lines to extract more structured information
        lines = [line.strip() for line in content.split('\n')[:10] if line.strip()]
        
        # Look for structured episode info in first few lines
        episode_info = {}
        url = ""
        
        for line in lines:
            if line.startswith("Episode:"):
                # Extract title from Episode: line
                episode_line = line.replace("Episode:", "").strip()
                if episode_line:
                    title = episode_line
                    # Extract episode number from this line too
                    episode_match = re.search(r'#?(\d+)', episode_line)
                    if episode_match:
                        episode_number = int(episode_match.group(1))
            elif line.startswith("URL:"):
                url = line.replace("URL:", "").strip()
            elif "---" in line:
                # Stop processing at separator line
                break
        
        # Extract subject/person from title (text in parentheses)
        subject = ""
        subject_match = re.search(r'\(([^)]+)\)$', title)
        if subject_match:
            subject = subject_match.group(1)
        
        # Extract the main person/company name before parentheses
        main_subject = re.sub(r'\s*\([^)]*\)$', '', title)
        
        # Clean strings to prevent JSON serialization issues
        def clean_string(s: str) -> str:
            if not isinstance(s, str):
                return str(s)
            # Remove problematic characters that can break JSON
            import json
            try:
                # Test if string is JSON serializable
                json.dumps(s)
                return s
            except (UnicodeDecodeError, TypeError):
                # Clean the string
                return s.encode('utf-8', errors='ignore').decode('utf-8')
        
        return {
            "episode_number": episode_number,
            "episode_title": clean_string(title),
            "main_subject": clean_string(main_subject),
            "subject_details": clean_string(subject),
            "url": clean_string(url),
            "filename": clean_string(filename),
            "total_tokens": self._count_tokens(content)
        }
    
    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI API."""
        try:
            response = openai.embeddings.create(
                model="text-embedding-3-small",  # Cost-effective option
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            time.sleep(1)  # Rate limiting
            return self._generate_embedding(text)  # Retry
    
    def process_single_file(self, filepath: Path) -> int:
        """Process a single transcript file and return number of chunks created."""
        print(f"Processing: {filepath.name}")
        
        # Read file content
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            return 0
        
        # Skip empty or very short files
        if len(content.strip()) < 100:
            print(f"Skipping {filepath.name} - too short")
            return 0
        
        # Extract metadata
        metadata = self._extract_metadata(filepath.name, content)
        
        # Split into chunks
        chunks = self.text_splitter.split_text(content)
        print(f"Created {len(chunks)} chunks from {filepath.name}")
        
        # Process each chunk
        points = []
        for i, chunk in enumerate(chunks):
            # Generate embedding
            embedding = self._generate_embedding(chunk)
            
            # Clean chunk text for JSON serialization
            clean_chunk = chunk.encode('utf-8', errors='ignore').decode('utf-8')
            
            # Create point with metadata - use UUID for point ID
            import uuid
            point_id = str(uuid.uuid4())
            
            # Ensure all payload values are JSON serializable
            payload = {
                "episode_number": int(metadata.get("episode_number", 0)),
                "episode_title": str(metadata.get("episode_title", "")),
                "main_subject": str(metadata.get("main_subject", "")),
                "subject_details": str(metadata.get("subject_details", "")),
                "url": str(metadata.get("url", "")),
                "filename": str(metadata.get("filename", "")),
                "chunk_index": int(i),
                "chunk_text": str(clean_chunk),
                "chunk_tokens": int(self._count_tokens(chunk))
            }
            
            point = models.PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload
            )
            points.append(point)
        
        # Batch insert to Qdrant with smaller batches
        try:
            # Insert in smaller batches to avoid large request issues
            batch_size = 10
            total_inserted = 0
            
            for i in range(0, len(points), batch_size):
                batch = points[i:i+batch_size]
                self.client.upsert(
                    collection_name=self.collection_name,
                    points=batch,
                    wait=True
                )
                total_inserted += len(batch)
            
            print(f"✅ Inserted {total_inserted} chunks for {filepath.name}")
            return total_inserted
        except Exception as e:
            print(f"Error inserting chunks for {filepath.name}: {e}")
            # Try to insert one by one to identify problematic points
            successful = 0
            for point in points:
                try:
                    self.client.upsert(
                        collection_name=self.collection_name,
                        points=[point],
                        wait=True
                    )
                    successful += 1
                except Exception as single_error:
                    print(f"Failed to insert point {point.id}: {single_error}")
            print(f"⚠️  Inserted {successful}/{len(points)} chunks for {filepath.name}")
            return successful
    
    def process_all_transcripts(self, transcript_dir: str = "./transcripts") -> None:
        """Process all transcript files in the directory."""
        transcript_path = Path(transcript_dir)
        
        if not transcript_path.exists():
            print(f"❌ Transcript directory not found: {transcript_dir}")
            return
        
        # Find all transcript files
        transcript_files = list(transcript_path.glob("*.txt")) + list(transcript_path.glob("*.md"))
        
        if not transcript_files:
            print(f"❌ No transcript files found in {transcript_dir}")
            return
        
        print(f"Found {len(transcript_files)} transcript files")
        
        total_chunks = 0
        failed_files = []
        
        # Process each file with progress bar
        for filepath in tqdm(transcript_files, desc="Processing transcripts"):
            try:
                chunks_created = self.process_single_file(filepath)
                total_chunks += chunks_created
                time.sleep(0.1)  # Small delay to avoid rate limits
            except Exception as e:
                print(f"Failed to process {filepath.name}: {e}")
                failed_files.append(filepath.name)
        
        # Summary
        print(f"\n📊 Processing Summary:")
        print(f"   Total files processed: {len(transcript_files) - len(failed_files)}")
        print(f"   Total chunks created: {total_chunks}")
        print(f"   Failed files: {len(failed_files)}")
        
        if failed_files:
            print(f"   Failed file list: {failed_files}")
        
        # Verify collection stats
        try:
            info = self.client.get_collection(self.collection_name)
            print(f"   Collection vector count: {info.vectors_count}")
        except Exception as e:
            print(f"   Could not verify collection: {e}")

def main():
    """Main processing function."""
    processor = TranscriptProcessor()
    processor.process_all_transcripts()

if __name__ == "__main__":
    main()