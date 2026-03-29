const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isDev = process.env.NODE_ENV !== 'production';

const protect = async (req, res, next) => {
    let token;

    if (isDev) {
        console.log('Auth Attempt - Cookies:', !!req.cookies?.accessToken, '| Header:', !!req.headers.authorization);
    }

    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2) {
            token = parts[1];
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        if (isDev) console.error('JWT Verification Error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role '${req.user?.role}' is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };
