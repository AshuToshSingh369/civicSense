const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


const { Server } = require('socket.io');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Socket connections
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a room based on departmentCode to receive specific alerts
    socket.on('join_department', (deptCode) => {
        socket.join(deptCode);
        console.log(`Socket ${socket.id} joined room: ${deptCode}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Make io accessible in routes
app.set('socketio', io);

// Basic error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

server.listen(port, () => console.log(`Server started on port ${port}`));

