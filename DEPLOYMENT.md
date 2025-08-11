# Deployment Guide: Frontend + Backend Separation

## Overview
The Tambola game is now split into two deployable components:
- **Frontend**: Static files (HTML, CSS, JS) → Deploy to GitHub Pages  
- **Backend**: Node.js API + Socket.IO server → Deploy to Render

## Step-by-Step Deployment

### 1. Deploy Backend to Render

1. Fork this repository
2. Go to [render.com](https://render.com) and sign in
3. Click "New +" → "Web Service"  
4. Connect your GitHub repo
5. Configure:
   - **Name**: `tambola-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Deploy and **copy the backend URL** (e.g., `https://tambola-backend.onrender.com`)

### 2. Configure Frontend

1. Edit `config.js` in your repository
2. Replace the placeholder URL with your Render backend URL:
   ```javascript
   if (window.location.hostname.includes('github.io')) {
       return 'https://your-tambola-backend.onrender.com'; // ← Your URL here
   }
   ```
3. Commit and push this change

### 3. Deploy Frontend to GitHub Pages

**Option A: Automatic (Recommended)**
1. Go to your repo Settings → Pages
2. Select "Deploy from a branch" 
3. Choose "main" branch and "/ (root)" folder
4. Your frontend will be at `https://yourusername.github.io/Tambola`

**Option B: GitHub Actions (Included)**
- The included workflow automatically deploys frontend files on every push
- Excludes backend-specific files (`server.js`, `package.json`, etc.)

### 4. Test Cross-Platform Functionality  

1. Visit your GitHub Pages URL
2. Create a room
3. Open the same URL on a different device
4. Join the room and verify real-time sync works

## Architecture Verification

✅ **Frontend** (GitHub Pages):
- Serves static HTML, CSS, JS files
- Connects to backend via CORS requests
- Environment detection in `config.js`

✅ **Backend** (Render):  
- Node.js API with Express
- Socket.IO for real-time communication
- CORS configured for GitHub Pages domains
- Health check endpoints

✅ **Communication**:
- API calls use `fetch()` to backend URL
- Socket.IO connects to backend URL
- CORS headers allow cross-origin requests

## Production Notes

- Render free tier may sleep after inactivity
- Backend uses in-memory storage (resets on deploy)
- For production: Consider Redis/MongoDB for persistence
- Monitor usage through Render dashboard

## Troubleshooting

**Frontend can't connect to backend:**
- Verify backend URL in `config.js` is correct
- Check Render backend is running (visit health endpoint)
- Ensure CORS is properly configured

**Socket.IO connection issues:**
- Backend CORS allows your GitHub Pages domain
- Socket.IO uses same URL as API calls
- Check browser developer console for errors