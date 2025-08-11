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