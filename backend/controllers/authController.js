const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendOTP } = require('../services/notificationService');

// ─── Token Helpers ─────────────────────────────────────────────────────────────

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Cookie options for httpOnly token
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/', // Explicitly set path to / to ensure cookie is sent to all routes
};

// Helper: build safe user payload (Token removed to enforce httpOnly cookie)
const userPayload = (user) => ({
    _id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentCode: user.departmentCode,
    homeDepartment: user.homeDepartment,
});

// ─── Validation Rules ──────────────────────────────────────────────────────────

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const verifyOTPValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be a 6-digit number'),
];

const createAuthorityValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('departmentCode').notEmpty().withMessage('Department code is required'),
];

// ─── Controllers ───────────────────────────────────────────────────────────────

// @desc    Register new user (Citizen only)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password, homeDepartment, tempCity } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otpCode = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'citizen',
            homeDepartment,
            tempCity,
            isVerified: false,
            otp: { code: otpCode, expires: otpExpires }
        });

        if (user) {
            await sendOTP(email, otpCode);
            return res.status(201).json({
                message: 'Registration successful. Please verify your email.',
                email: user.email,
                userId: user._id
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Create Authority Account
// @route   POST /api/auth/create-authority
// @access  Private (Admin/Authority only)
const createAuthority = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password, departmentCode, homeDepartment } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'authority',
            departmentCode,
            homeDepartment,
            isVerified: true
        });

        if (user) {
            return res.status(201).json({
                message: 'Authority account created successfully.',
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                departmentCode: user.departmentCode
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error creating authority' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
const verifyOTP = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (!user.otp || user.otp.code !== code || user.otp.expires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        await user.save();

        const token = generateAccessToken(user._id);
        res.cookie('accessToken', token, cookieOptions);

        return res.status(200).json(userPayload(user));
    } catch (error) {
        return res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }

        const token = generateAccessToken(user._id);
        res.cookie('accessToken', token, cookieOptions);

        return res.json(userPayload(user));
    } catch (error) {
        return res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Logout user - clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
    res.clearCookie('accessToken');
    return res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Handle Google Auth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = (req, res) => {
    // Passport will have attached the user to req.user
    if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=GoogleAuthFailed`);
    }

    // Generate token
    const token = generateAccessToken(req.user._id);

    // Set cookie
    res.cookie('accessToken', token, cookieOptions);

    // Get safe payload to send back to client via URL fragment or query parameter
    // Since we are redirecting to the frontend, we can pass user data safely in the URL hash or query
    const payload = Buffer.from(JSON.stringify(userPayload(req.user))).toString('base64');

    // Redirect to frontend auth-success page that will grab the data and redirect to dashboard
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/success?data=${payload}`);
};

// @desc    Update user profile (specifically for location completion)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    const { homeDepartment, departmentCode } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.homeDepartment = homeDepartment || user.homeDepartment;
        user.departmentCode = departmentCode || user.departmentCode;

        const updatedUser = await user.save();

        return res.json(userPayload(updatedUser));
    } catch (error) {
        return res.status(500).json({ message: 'Server error updating profile' });
    }
};

module.exports = {
    registerUser,
    registerValidation,
    createAuthority,
    createAuthorityValidation,
    verifyOTP,
    verifyOTPValidation,
    loginUser,
    loginValidation,
    logoutUser,
    googleCallback,
    updateProfile,
};
