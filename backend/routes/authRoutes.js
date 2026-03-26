const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect, authorize } = require('../config/authMiddleware');
const {
    registerUser,
    createAuthority,
    verifyOTP,
    loginUser,
    logoutUser,
    googleCallback,
    updateProfile
} = require('../controllers/authController');

// @desc    Register new user (Citizen only)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Create Authority Account
// @route   POST /api/auth/create-authority
// @access  Private (Admin/Authority only)
router.post('/create-authority', protect, authorize('admin', 'authority'), createAuthority);

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
router.post('/verify', verifyOTP);

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, logoutUser);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, updateProfile);

// ==========================================
// GOOGLE OAUTH ROUTES
// ==========================================

// @desc    Initiate Google Auth
// @route   GET /api/auth/google
// @access  Public
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @desc    Google Auth Callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=GoogleAuthFailed' }),
    googleCallback
);

module.exports = router;
