const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage for rooms (in production, use a database)
const rooms = new Map();

// API Routes

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
        rules: rules || [],
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
        rule.claimedBy = null;
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
        rule.claimedBy = winnerName;
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