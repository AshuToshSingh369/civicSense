const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect, authorize } = require('../config/authMiddleware');
const { analyzeReport } = require('../services/aiService');
const { sendNotification } = require('../services/notificationService');
const upload = require('../middleware/uploadMiddleware');

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
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { title, description, location, coordinates, targetDepartment, category } = req.body;

        // Handle file path if image uploaded
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Parse coordinates if they come as a string (from FormData)
        let parsedCoords = coordinates;
        if (typeof coordinates === 'string') {
            try {
                parsedCoords = JSON.parse(coordinates);
            } catch (e) {
                console.error("Coords parsing failed", e);
            }
        }

        // 1. Save initial report
        let report = await Report.create({
            user: req.user._id,
            title,
            description,
            location,
            coordinates: parsedCoords,
            imageUrl,
            targetDepartment,
            category: category || 'General'
        });

        // 2. Run AI Analysis
        try {
            const aiResult = await analyzeReport({ title, description, imageUrl });

            // 3. Update Report with AI results
            report.aiAnalysis = aiResult;
            report.aiProcessedAt = Date.now();
            await report.save();

            // 4. Send Global Socket Notification
            const io = req.app.get('socketio');
            io.emit('new_report', report);

            // 5. Send Specific Department Notification
            if (report.targetDepartment) {
                io.to(report.targetDepartment).emit('department_alert', {
                    message: 'New high-priority report in your ward!',
                    report: report
                });
            }

            // 6. Send Email if needed
            await sendNotification(report, aiResult);

        } catch (aiError) {
            console.error('AI Processing Error:', aiError);
        }

        res.status(201).json(report);
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

        // Notify user/authority of status change
        const io = req.app.get('socketio');
        io.emit('status_updated', report);

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

