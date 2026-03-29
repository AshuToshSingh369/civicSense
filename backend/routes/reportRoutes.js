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




router.get('/public/stats', getPublicStats);



router.get('/public/recent', getPublicRecentReports);



router.get('/public/top-contributors', getTopContributors);


router.use(protect);




router.get('/', getReports);




router.get('/:id', getReportById);




router.post('/', upload.single('image'), createReportValidation, createReport);




router.put('/:id/status', authorize('authority', 'admin'), updateReportStatus);

module.exports = router;
