# Render Deployment Steps - Action Items

## Immediate Steps After Transcript Processing Completes

### 1. Test Local Setup First
```bash
# Start local Qdrant (if not running)
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant:v1.7.4

# Start frontend
npm run dev

# Visit http://localhost:5173 and test searches
# Verify rate limiting works (try 4+ searches)
```

### 2. Create Render Account & Deploy Qdrant

1. **Sign up at https://render.com** (free account)

2. **Connect GitHub Repository**
   - Link your GitHub account
   - Grant access to the founders-rag-chat repository

3. **Create New Web Service**
   - Click "New" → "Web Service"
   - Select your repository
   - Name: `founders-rag-qdrant`
   - Region: Oregon (cheapest)
   - Branch: `main`

4. **Configure Docker Build**
   - Runtime: `Docker`
   - Dockerfile Path: `docker/Dockerfile.qdrant`
   - Build Command: (leave empty)
   - Start Command: `./qdrant`

5. **Environment Variables**
   ```
   QDRANT__STORAGE__STORAGE_PATH=/qdrant/storage
   ```

6. **Instance Type**
   - Select: `Starter` ($7/month)
   - 0.5 CPU, 512MB RAM (sufficient for hobby project)

7. **Persistent Disk**
   - Add persistent disk: `/qdrant/storage`
   - Size: 10GB (enough for transcripts)

8. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy the URL (format: `https://your-app-name.onrender.com`)

### 3. Process Transcripts on Production Qdrant

```bash
# Update .env file with production URL
QDRANT_URL_PRODUCTION=https://your-render-app-name.onrender.com
NODE_ENV=production

# Setup and process on production
python scripts/setup_qdrant.py
python scripts/process_transcripts.py
```

### 4. Set Up Google Analytics

1. **Create GA4 Property**
   - Go to https://analytics.google.com
   - Click "Start measuring"
   - Create account: "Founders RAG Chat"
   - Property name: "Founders RAG Chat"
   - Industry: Technology
   - Business size: Small
   - Country: United States

2. **Get Measurement ID**
   - Complete setup → Web
   - Website URL: (you'll add this later with custom domain)
   - Copy Measurement ID (G-XXXXXXXXXX)

3. **Update Environment Variables**
   ```bash
   # Add to .env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### 5. Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel
   ```

3. **Add Environment Variables**
   ```bash
   vercel env add VITE_QDRANT_URL
   # Enter: https://your-render-app-name.onrender.com

   vercel env add VITE_OPENAI_API_KEY
   # Enter: your OpenAI API key

   vercel env add VITE_GA_MEASUREMENT_ID
   # Enter: G-XXXXXXXXXX
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### 6. Test Production Setup

1. **Visit your Vercel URL**
2. **Test search functionality**
3. **Verify rate limiting (try 4+ searches)**
4. **Check Google Analytics Real-time reports**

### 7. Custom Domain (When Ready)

1. **Buy domain** (recommend Namecheap, ~$10-15/year)
2. **Add to Vercel**
   - Vercel Dashboard → Project → Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions
3. **Update Google Analytics**
   - GA4 → Admin → Property Settings → Update website URL

## Expected Costs

- **Initial setup**: $5-10 (OpenAI API for processing)
- **Monthly**: 
  - Render Qdrant: $7
  - Vercel: Free
  - Google Analytics: Free
  - OpenAI API (with rate limiting): $5-15
  - **Total: $12-22/month**

## What to Expect

1. **Render deployment**: 5-10 minutes
2. **Transcript processing on production**: 20-30 minutes
3. **Vercel deployment**: 2-3 minutes
4. **Total setup time**: ~1 hour

## Troubleshooting

### Common Issues:
1. **Qdrant connection failed**: Check Render logs
2. **Build failed on Render**: Verify Dockerfile path
3. **Frontend can't connect**: Verify VITE_QDRANT_URL
4. **Rate limiting not working**: Check browser localStorage

### Getting Help:
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- This repository issues: Create GitHub issue if problems persist

## Ready to Deploy?

Once your transcript processing completes, follow these steps in order. Each step builds on the previous one. Let me know if you hit any issues!