# Founders RAG Chat - Deployment Guide

This guide covers local development setup and production deployment for the Founders RAG Chat application.

## Overview

The application consists of three main components:
1. **Qdrant Vector Database** - Stores embeddings and metadata
2. **Python Data Processing** - Processes transcripts and creates embeddings
3. **React Frontend** - User interface for search and chat

## Local Development Setup

### Prerequisites
- Docker and Docker Compose
- Python 3.8+
- Node.js 18+
- OpenAI API key

### Step 1: Start Local Qdrant Instance

```bash
# Start Qdrant with Docker
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant:v1.7.4
```

**Verify Qdrant is running:**
```bash
curl http://localhost:6333/health
# Should return: {"title":"qdrant - vector search engine","version":"1.7.4"}
```

### Step 2: Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Ensure your `.env` file contains:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here

# Qdrant Configuration (Local)
QDRANT_URL_LOCAL=http://localhost:6333
QDRANT_URL_PRODUCTION=https://your-qdrant-instance.onrender.com

# Environment
NODE_ENV=development

# Frontend Environment Variables
VITE_QDRANT_URL=http://localhost:6333
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
```

### Step 4: Initialize Qdrant Collection

```bash
# Run the setup script
python scripts/setup_qdrant.py
```

**Expected Output:**
```
Connecting to Qdrant at: http://localhost:6333
Collection founders_transcripts doesn't exist, creating new one
✅ Created collection: founders_transcripts
```

### Step 5: Process Transcripts (Currently Running)

```bash
# Process all transcripts - this may take 20-30 minutes
python scripts/process_transcripts.py
```

**Monitor Progress:**
- Check terminal output for processing updates
- Each transcript will show: filename, chunks created, embedding status

### Step 6: Install Frontend Dependencies

```bash
# Install npm packages
npm install
```

### Step 7: Start Development Server

```bash
# Start React development server
npm run dev
```

**Access Application:**
- Frontend: http://localhost:5173
- Qdrant Dashboard: http://localhost:6333/dashboard

## Production Deployment (Budget-Optimized for <$50/month)

### Step 1: Render.com for Qdrant (Recommended)

#### Qdrant on Render

1. **Create Render Account**
   - Sign up at https://render.com

2. **Deploy Qdrant Service**
   - Connect your GitHub repository
   - Create new Web Service
   - Use Docker deployment with `docker/Dockerfile.qdrant`
   - Set environment variables:
     ```
     QDRANT__STORAGE__STORAGE_PATH=/qdrant/storage
     ```

3. **Configure Persistent Storage**
   - Add persistent disk for `/qdrant/storage`
   - Recommended: 10GB minimum

4. **Update Environment Variables**
   - Copy your Render Qdrant URL to `.env`:
     ```
     QDRANT_URL_PRODUCTION=https://your-app-name.onrender.com
     ```

#### Process Transcripts on Production

```bash
# Set environment for production
export NODE_ENV=production

# Run setup and processing on production Qdrant
python scripts/setup_qdrant.py
python scripts/process_transcripts.py
```

### Step 2: Vercel for Frontend (Free Tier)

#### Frontend on Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**
   - Add to Vercel dashboard or via CLI:
     ```bash
     vercel env add VITE_QDRANT_URL
     vercel env add VITE_OPENAI_API_KEY
     vercel env add VITE_GA_MEASUREMENT_ID
     ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Update Environment Variables**
   - Set `VITE_QDRANT_URL` to your Render Qdrant URL
   - Get Google Analytics measurement ID from https://analytics.google.com
   - Redeploy after environment changes

### Step 3: Google Analytics Setup (Free)

1. **Create Google Analytics Account**
   - Go to https://analytics.google.com
   - Create new property for your domain
   - Copy the Measurement ID (format: G-XXXXXXXXXX)

2. **Add to Environment Variables**
   ```bash
   # Local development
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Vercel production
   vercel env add VITE_GA_MEASUREMENT_ID G-XXXXXXXXXX
   ```

### Step 4: Rate Limiting Features

✅ **Already Implemented:**
- 3 queries per hour per user (browser-based)
- 1 hour cooldown period
- Local storage tracking (no database needed)
- Visual indicators for remaining queries
- Privacy-friendly (no user tracking)

### Step 5: Enhanced Features Added

✅ **Rate Limiting Implementation:**
- `src/hooks/useRateLimit.ts` - Browser-based rate limiting
- Visual query counter in UI header
- Automatic cooldown timer display
- Search button disabled when rate limited
- Error messages with time remaining

✅ **Google Analytics Integration:**
- `src/lib/analytics.ts` - Privacy-friendly tracking
- Tracks search success/failure rates
- Monitors rate limiting hits
- No personal data collected
- Free tier compatible

✅ **UI Enhancements:**
- Rate limit status badge in header
- Dynamic query counter (3/3, 2/3, etc.)
- Countdown timer when rate limited
- Enhanced error messaging

## Alternative Deployment Options

### Self-Hosted VPS

#### Requirements
- Ubuntu 20.04+ server
- 4GB+ RAM
- 20GB+ storage
- Docker installed

#### Setup Script
```bash
#!/bin/bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/yourusername/founders-rag-chat.git
cd founders-rag-chat

# Start Qdrant
docker run -d -p 6333:6333 -v ./qdrant_storage:/qdrant/storage qdrant/qdrant:v1.7.4

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Process transcripts
python scripts/setup_qdrant.py
python scripts/process_transcripts.py

# Build frontend
npm install
npm run build

# Serve with nginx or similar
```

### AWS/GCP/Azure Options

#### Qdrant on Cloud
- **AWS**: ECS with persistent EBS volumes
- **GCP**: Cloud Run with persistent disks
- **Azure**: Container Instances with file shares

#### Frontend on CDN
- **AWS**: S3 + CloudFront
- **GCP**: Storage + CDN
- **Azure**: Static Web Apps

## Monitoring and Maintenance

### Health Checks

```bash
# Check Qdrant health
curl https://your-qdrant-url.com/health

# Check collection status
curl https://your-qdrant-url.com/collections/founders_transcripts
```

### Backup Strategy

```bash
# Backup Qdrant collection
curl -X POST "https://your-qdrant-url.com/collections/founders_transcripts/snapshots"

# Download snapshot
curl "https://your-qdrant-url.com/collections/founders_transcripts/snapshots/{snapshot_name}" --output backup.snapshot
```

### Performance Optimization

1. **Qdrant Optimization**
   - Increase memory allocation
   - Configure indexing parameters
   - Monitor query performance

2. **Frontend Optimization**
   - Enable compression
   - Implement response caching
   - Add error boundaries

## Troubleshooting

### Common Issues

1. **Qdrant Connection Failed**
   ```bash
   # Check if Qdrant is running
   docker ps | grep qdrant
   # Check logs
   docker logs container_id
   ```

2. **OpenAI API Errors**
   - Verify API key is valid
   - Check rate limits
   - Monitor usage quotas

3. **Frontend Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Python Dependencies**
   ```bash
   # Update pip and reinstall
   pip install --upgrade pip
   pip install -r requirements.txt --force-reinstall
   ```

5. **Transcript Processing Errors**
   - **JSON Format Errors**: Some transcript files may contain special characters
   - **Fix**: Updated `process_transcripts.py` with string cleaning
   - **Restart**: If processing failed, restart with: `python scripts/process_transcripts.py`
   - **Qdrant 400 Errors**: Usually character encoding issues, now handled automatically

## Cost Estimation

### Development
- **Qdrant (Local)**: Free
- **OpenAI API**: ~$5-10 for initial processing
- **Total**: ~$5-10

### Production (Monthly) - Budget Optimized
- **Render Qdrant**: $7/month (Starter plan)
- **Vercel Frontend**: Free tier (100GB bandwidth)
- **Google Analytics**: Free
- **OpenAI API**: ~$5-15/month (with rate limiting)
- **Total**: ~$12-22/month ✅ Under $50 budget

### Cost Optimization Tips
1. **Rate limiting** reduces OpenAI API costs significantly
2. **Vercel free tier** handles up to 100GB bandwidth monthly
3. **Render starter plan** sufficient for hobby project
4. **Google Analytics** free for standard features

## Security Considerations

1. **API Keys**
   - Never commit to repository
   - Use environment variables
   - Rotate regularly

2. **Network Security**
   - Enable HTTPS everywhere
   - Configure CORS properly
   - Use authentication if needed

3. **Data Protection**
   - Regular backups
   - Access logging
   - Monitor unusual activity

## Questions for You

1. **Hosting Preference**: Do you prefer Render.com for Qdrant or would you like to explore other options?

2. **Domain**: Do you have a custom domain you'd like to use?

3. **Authentication**: Do you want to add user authentication/access control?

4. **Analytics**: Would you like to add usage analytics (like Posthog or Google Analytics)?

5. **Monitoring**: Do you want error tracking (like Sentry) or performance monitoring?

6. **Budget**: What's your preferred monthly hosting budget?

Let me know your preferences and I'll update the deployment steps accordingly!