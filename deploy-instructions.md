# Deploy Transcript Processor to Render

## Option 1: GitHub Deploy (Recommended)

1. **Open Terminal in a NEW window**
2. **Run these commands:**
```bash
# Copy processor to your Desktop
cp -r ~/Development/founders-rag-chat/render-processor ~/Desktop/founders-processor

# Go to the new directory
cd ~/Desktop/founders-processor

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/founders-processor.git
git push -u origin main
```

3. **Deploy on Render:**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect GitHub and select "founders-processor" repo
   - Environment: Docker
   - Add environment variable:
     - Key: `OPENAI_API_KEY`
     - Value: Your OpenAI API key
   - Click "Create Web Service"

## Option 2: Direct Docker Deploy

Since Render might not support manual uploads easily, you can:

1. **Use the zip file** at: `~/Development/founders-rag-chat/processor.zip`
2. **Upload to a file sharing service** (Google Drive, Dropbox)
3. **Contact Render support** for manual deployment options

## What Happens Next:

1. Service will take 5-10 minutes to build and deploy
2. Visit your service URL (e.g., https://founders-processor.onrender.com)
3. Click "Start Processing" 
4. Wait 20-30 minutes for all transcripts to process
5. Your app will be fully functional!

## Important Notes:

- The processor will connect to your Qdrant at: https://qdrant-founders.onrender.com
- Make sure to add your OpenAI API key as environment variable
- Processing creates ~5,900 embeddings across 269 transcript files