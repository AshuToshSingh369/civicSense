const express = require('express');
const dotenv = require('dotenv').config();                                                              
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const { Server } = require('socket.io');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST', 'PUT'],
        credentials: true
    }
});


app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } 
}));


app.use(cors({
    origin: CLIENT_URL,
    credentials: true 
}));


const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', generalLimiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


const passport = require('passport');
require('./config/passport');
app.use(passport.initialize());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));


const initializeSocketIO = require('./config/socketHandler');
initializeSocketIO(io);


app.set('socketio', io);


app.use((err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    console.error(`[CRITICAL ERROR] ${req.method} ${req.url}:`, err);
    res.status(statusCode);
    res.json({
        message: err.message,
        
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
});

server.listen(port, () => console.log(`[CivicSense] Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`));
