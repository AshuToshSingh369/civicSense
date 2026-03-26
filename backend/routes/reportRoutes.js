const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../config/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    getReports,
    getReportById,
    createReport,
    createReportValidation,
    updateReportStatus,
    getPublicRecentReports,
    getTopContributors,
    getPublicStats
} = require('../controllers/reportController');

// ── Public routes (no auth required — for landing page) ──────────────────────
// @desc  Get public stats
// @route GET /api/reports/public/stats
router.get('/public/stats', getPublicStats);

// @desc  Get 2 most recent reports
// @route GET /api/reports/public/recent
router.get('/public/recent', getPublicRecentReports);

// @desc  Get top 3 contributors
// @route GET /api/reports/public/top-contributors
router.get('/public/top-contributors', getTopContributors);

// All routes below this line are protected
router.use(protect);

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
router.get('/', getReports);

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
router.get('/:id', getReportById);

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
router.post('/', upload.single('image'), createReportValidation, createReport);

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private (Authority only)
router.put('/:id/status', authorize('authority', 'admin'), updateReportStatus);

module.exports = router;
