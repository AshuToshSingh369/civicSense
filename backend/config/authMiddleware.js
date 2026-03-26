const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Support Bearer token (API) or httpOnly cookie (Browser)
    // Preference is given to the HTTP-Only cookie for security if both exist
    console.log('DEBUG: Auth Attempt');
    console.log('- Cookies:', req.cookies);
    console.log('- Auth Header:', req.headers.authorization);

    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
        console.log('- Token found in cookie');
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2) {
            token = parts[1];
            console.log('- Token found in Bearer header');
        }
    }

    if (!token) {
        console.log('DEBUG: No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.log('DEBUG: User not found in DB for ID:', decoded.id);
            return res.status(401).json({ message: 'User not found' });
        }

        console.log('DEBUG: Auth Success for:', req.user.email);
        next();
    } catch (error) {
        console.error('DEBUG: JWT Verification Error:', error.message);
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
