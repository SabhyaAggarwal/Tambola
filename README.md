# Tambola/Housie Cross-Platform Game

A real-time multiplayer Tambola/Housie game with separated frontend and backend architecture for easy deployment.

## Architecture

This game uses a **separated architecture**:
- **Frontend**: Deployed on GitHub Pages (static files)
- **Backend**: Deployed on Render (Node.js API + Socket.IO)
- **Communication**: Cross-origin requests with CORS configuration

## Features

- **Cross-platform gameplay**: Players can create and join rooms from different devices
- **Real-time synchronization**: All players see number calls and game updates instantly  
- **Room-based multiplayer**: Create private rooms with custom rules
- **Rule management**: Set up custom winning conditions (Full House, First Line, etc.)
- **Role-based permissions**: Only room creators can call numbers and approve claims
- **Cloud deployment ready**: Frontend on GitHub Pages, Backend on Render

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```

3. **Access the game:**
   Open `http://localhost:3000` in your browser

### Production Usage

Visit the deployed frontend at your GitHub Pages URL. The frontend automatically connects to the backend deployed on Render.

## How to Play

### Creating a Room
1. Click "Start a Game"
2. Enter a unique room name
3. Set up game rules (winning conditions)
4. Share the room name with other players

### Joining a Room
1. Click "Join a Game"
2. Enter the room name provided by the creator
3. Wait for the game to begin

### During the Game
- **Room Creator**: Can call numbers using "Next Number" button
- **All Players**: Can claim rules when they achieve winning conditions
- **Real-time Updates**: All players see the same game state simultaneously

## Technical Details

- **Backend**: Node.js with Express and Socket.IO
- **Frontend**: Vanilla JavaScript with real-time WebSocket communication
- **Data Storage**: In-memory storage (suitable for demo/development)

## API Endpoints

- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:roomName` - Get room data
- `POST /api/rooms/:roomName/join` - Join a room
- `PUT /api/rooms/:roomName/call-number` - Call a number (creator only)
- `PUT /api/rooms/:roomName/reset` - Reset game (creator only)
- `PUT /api/rooms/:roomName/claim` - Handle rule claims

## Socket Events

- `join-room` - Join a specific room
- `number-called` - Broadcast when a number is called
- `game-reset` - Broadcast when game is reset
- `rule-claimed` - Broadcast when a rule is successfully claimed

## Deployment

This application uses a **separated deployment architecture**:

### Backend Deployment (Render)

Deploy the backend API and Socket.IO server to Render:

#### Automatic Deployment (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Render:**
   - Go to [render.com](https://render.com) and sign up/log in
   - Click "New +" → "Web Service"
   - Connect your GitHub account and select your forked repository

3. **Configure the service:**
   - **Name**: `tambola-backend` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or upgrade as needed)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your backend
   - Your backend will be available at `https://your-app-name.onrender.com`

5. **Note your backend URL** - you'll need it for frontend configuration

### Frontend Deployment (GitHub Pages)

Deploy the frontend to GitHub Pages:

#### Automatic Deployment

1. **Update Backend URL:**
   - Edit `config.js` in your forked repository
   - Replace `'https://tambola-backend.onrender.com'` with your actual Render backend URL

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click Settings → Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click Save

3. **Access your game:**
   - Your frontend will be available at `https://yourusername.github.io/Tambola`
   - The frontend automatically connects to your Render backend

#### Alternative: GitHub Actions (Included)

This repository includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that automatically:
- Builds and deploys frontend files to GitHub Pages
- Excludes backend-specific files
- Triggers on every push to main branch

### Configuration

#### Backend URL Configuration

Update the backend URL in `config.js`:

```javascript
// Replace with your actual Render backend URL
if (window.location.hostname.includes('github.io')) {
    return 'https://your-tambola-backend.onrender.com';
}
```

#### Environment Variables (Backend)

For production deployment on Render:
- `NODE_ENV=production` (automatically set)
- `PORT` (automatically set by Render)

### Testing Cross-Platform Deployment

1. **Deploy backend** to Render and note the URL
2. **Update config.js** with your backend URL
3. **Deploy frontend** to GitHub Pages
4. **Test functionality**:
   - Create room from one device/browser
   - Join from another device using your GitHub Pages URL
   - Verify real-time communication works across platforms

### Alternative Deployment Options

#### Backend Alternatives to Render
- **Heroku**: Use included `package.json` scripts
- **Railway**: Auto-deploys from GitHub
- **DigitalOcean App Platform**: Node.js support
- **Vercel**: Serverless functions (requires modifications)

#### Frontend Alternatives to GitHub Pages
- **Netlify**: Drag-and-drop deployment
- **Vercel**: Git-based deployment
- **Surge.sh**: Simple static hosting

### Important Notes

- **Free tier limitations**: Render's free tier may spin down after inactivity
- **CORS configuration**: Backend is configured to accept requests from `.github.io` domains
- **In-memory storage**: Current implementation resets data on backend restarts
- **For production**: Consider using Redis/MongoDB for persistent storage
