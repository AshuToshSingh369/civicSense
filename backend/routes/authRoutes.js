const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect, authorize } = require('../config/authMiddleware');
const {
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
    updateProfilePhoto
} = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

router.post('/register', registerValidation, registerUser);

router.post('/create-authority', protect, authorize('admin', 'authority'), createAuthorityValidation, createAuthority);

router.post('/verify', verifyOTPValidation, verifyOTP);

router.post('/login', loginValidation, loginUser);

router.post('/logout', protect, logoutUser);

router.put('/profile', protect, updateProfile);

router.put('/profile-photo', protect, uploadProfilePhoto.single('image'), updateProfilePhoto);

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=GoogleAuthFailed' }),
    googleCallback
);

module.exports = router;
