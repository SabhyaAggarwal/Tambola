const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);
            
            // Allow GitHub Pages domains
            if (origin.includes('.github.io') || 
                origin.includes('localhost') || 
                origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
            
            // Default allow all for development
            return callback(null, true);
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow GitHub Pages domains
        if (origin.includes('.github.io') || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        // Default allow all for development
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// In-memory storage for rooms (in production, use a database)
const rooms = new Map();

// API Routes

// Serve the main game page
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Tambola Backend Server',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Tambola Backend Server',
        timestamp: new Date().toISOString()
    });
});

// Get room data
app.get('/api/rooms/:roomName', (req, res) => {
    const { roomName } = req.params;
    const room = rooms.get(roomName);
    
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room);
});

// Create a room
app.post('/api/rooms', (req, res) => {
    const { roomName, rules, moneyEnabled } = req.body;
    
    if (rooms.has(roomName)) {
        return res.status(400).json({ error: 'Room already exists' });
    }
    
    const roomData = {
        roomName,
        isCreator: true,
        moneyEnabled: moneyEnabled || false,
        rules: rules.map(rule => ({ ...rule, claimedBy: [] })) || [],
        calledNumbers: [],
        createdAt: new Date().toISOString()
    };
    
    rooms.set(roomName, roomData);
    
    res.status(201).json(roomData);
});

// Join a room
app.post('/api/rooms/:roomName/join', (req, res) => {
    const { roomName } = req.params;
    const room = rooms.get(roomName);
    
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    // Return room data for joining player
    const joinData = {
        ...room,
        isCreator: false // Joiners are not creators
    };
    
    res.json(joinData);
});

// Call a number
app.put('/api/rooms/:roomName/call-number', (req, res) => {
    const { roomName } = req.params;
    const { number } = req.body;
    const room = rooms.get(roomName);
    
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    if (!room.calledNumbers.includes(number)) {
        room.calledNumbers.push(number);
        rooms.set(roomName, room);
        
        // Broadcast to all clients in this room
        io.to(roomName).emit('number-called', { number, calledNumbers: room.calledNumbers });
    }
    
    res.json(room);
});

// Reset game
app.put('/api/rooms/:roomName/reset', (req, res) => {
    const { roomName } = req.params;
    const room = rooms.get(roomName);
    
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    room.calledNumbers = [];
    // Reset rule claims
    room.rules.forEach(rule => {
        rule.claimedBy = [];
    });
    
    rooms.set(roomName, room);
    
    // Broadcast reset to all clients
    io.to(roomName).emit('game-reset', room);
    
    res.json(room);
});

// Claim a rule
app.put('/api/rooms/:roomName/claim', (req, res) => {
    const { roomName } = req.params;
    const { ruleName, winnerName, approved } = req.body;
    const room = rooms.get(roomName);
    
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    const rule = room.rules.find(r => r.name === ruleName);
    if (!rule) {
        return res.status(404).json({ error: 'Rule not found' });
    }
    
    if (approved && winnerName) {
        if (!rule.claimedBy) {
            rule.claimedBy = [];
        }
        rule.claimedBy.push(winnerName);
        rooms.set(roomName, room);
        
        // Broadcast rule claim to all clients
        io.to(roomName).emit('rule-claimed', { ruleName, winnerName, room });
    }
    
    res.json(room);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join a room
    socket.on('join-room', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.id} joined room ${roomName}`);
        
        // Send current room state to the joining user
        const room = rooms.get(roomName);
        if (room) {
            socket.emit('room-state', room);
        }
    });
    
    // Leave a room
    socket.on('leave-room', (roomName) => {
        socket.leave(roomName);
        console.log(`User ${socket.id} left room ${roomName}`);
    });
    
    // Handle claim requests from non-creators
    socket.on('claim-request', (data) => {
        const { roomName, ruleName, playerName } = data;
        console.log(`Claim request for ${ruleName} in room ${roomName} from player ${playerName}`);
        
        // Broadcast the claim request to all clients in the room
        // The creator client will handle showing the verification modal
        io.to(roomName).emit('claim-request-received', {
            ruleName,
            playerName,
            roomName
        });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the game at: http://localhost:${PORT}`);
});