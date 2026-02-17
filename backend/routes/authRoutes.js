const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const { sendOTP } = require('../services/notificationService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, departmentCode, homeDepartment } = req.body;

    try {
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Please add all fields' });
            return;
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            departmentCode,
            homeDepartment,
            isVerified: false,
            otp: {
                code: otpCode,
                expires: otpExpires
            }
        });

        if (user) {
            await sendOTP(email, otpCode);
            res.status(201).json({
                message: 'Registration successful. Please verify your email.',
                email: user.email,
                userId: user._id
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
router.post('/verify', async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp.code !== code || user.otp.expires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined; // Clear OTP after verification
        await user.save();

        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentCode: user.departmentCode,
            homeDepartment: user.homeDepartment,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email before logging in.' });
            }
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                departmentCode: user.departmentCode,
                homeDepartment: user.homeDepartment,
                token: generateToken(user._id)
            });
        } else {

            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
