# Tambola/Housie Cross-Platform Game

A real-time multiplayer Tambola/Housie game with cross-platform join ability.

## Features

- **Cross-platform gameplay**: Players can create and join rooms from different devices
- **Real-time synchronization**: All players see number calls and game updates instantly
- **Room-based multiplayer**: Create private rooms with custom rules
- **Rule management**: Set up custom winning conditions (Full House, First Line, etc.)
- **Role-based permissions**: Only room creators can call numbers and approve claims

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the game:**
   Open `http://localhost:3000` in your browser

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

### Deploy to Render

The easiest way to deploy this game is using [Render](https://render.com), which offers free hosting for Node.js applications.

#### Automatic Deployment (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Render:**
   - Go to [render.com](https://render.com) and sign up/log in
   - Click "New +" → "Web Service"
   - Connect your GitHub account and select your forked repository

3. **Configure the service:**
   - **Name**: `tambola-game` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or upgrade as needed)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Your game will be available at `https://your-app-name.onrender.com`

#### Manual Deployment

1. **Upload your code** to a Git repository (GitHub, GitLab, etc.)

2. **Use the render.yaml file**: This repository includes a `render.yaml` file for automatic configuration

3. **Connect and deploy** following the steps above

#### Environment Variables

For production deployment, you may want to set:
- `NODE_ENV=production`
- `PORT` (automatically set by Render)

#### Important Notes

- **Free tier limitations**: Render's free tier may spin down after inactivity
- **Persistent storage**: Current implementation uses in-memory storage, which resets on deployment
- **For production**: Consider upgrading to a paid plan and using a database (Redis/MongoDB) for persistence

### Other Deployment Options

- **Heroku**: Similar process, use the included `package.json` scripts
- **Railway**: Auto-deploys from GitHub with minimal configuration  
- **DigitalOcean App Platform**: Supports Node.js apps with simple setup
- **Vercel**: Good for serverless deployment (may require modifications)

### Post-Deployment

1. **Share your game URL** with players
2. **Test cross-platform functionality** by accessing from different devices
3. **Monitor usage** through your hosting platform's dashboard