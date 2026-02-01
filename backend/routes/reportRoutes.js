const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect, authorize } = require('../config/authMiddleware');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, description, location, coordinates, imageUrl, targetDepartment, category } = req.body;

    try {
        const report = await Report.create({
            user: req.user._id,
            title,
            description,
            location,
            coordinates,
            imageUrl,
            targetDepartment,
            category
        });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private (Authority only)
router.put('/:id/status', protect, authorize('authority', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
