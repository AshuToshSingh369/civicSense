const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const { analyzeReport } = require('../services/aiService');
const { sendNotification, sendStatusChangeNotification } = require('../services/notificationService');

// ─── Validation Rules ──────────────────────────────────────────────────────────

const createReportValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('contactNumber').trim().matches(/^\d{10}$/).withMessage('Contact number must be exactly 10 digits'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('targetDepartment').trim().notEmpty().withMessage('Target department is required'),
    body('category').optional().trim(),
];

// ─── Controllers ───────────────────────────────────────────────────────────────

// @desc    Get all reports with advanced filtering
// @route   GET /api/reports?status=pending&department=DEPT&priority=high&sort=-createdAt
// @access  Private
const getReports = async (req, res) => {
    try {
        let query = {};
        let sortOption = { createdAt: -1 }; // Default: newest first

        // ─── AUTHORIZATION ───────────────────────────────────────────────────────
        const isGlobalUser = req.user.role === 'admin' || req.user.email === 'chairman@gmail.com';

        if (!isGlobalUser && req.user.role === 'authority') {
            query.targetDepartment = req.user.departmentCode;
        } else if (!isGlobalUser && req.user.role === 'citizen') {
            // Citizens only see their own reports
            query.user = req.user._id;
        }

        // ─── STATUS FILTER ───────────────────────────────────────────────────────
        if (req.query.status) {
            const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
            if (validStatuses.includes(req.query.status)) {
                query.status = req.query.status;
            }
        }

        // ─── DEPARTMENT FILTER ───────────────────────────────────────────────────
        if (req.query.department && isGlobalUser) {
            query.targetDepartment = req.query.department;
        }

        // ─── PRIORITY/SEVERITY FILTER ───────────────────────────────────────────
        if (req.query.priority) {
            const priorityMap = { low: 1, medium: 2, medium: 3, high: 4, critical: 5 };
            const minPriority = priorityMap[req.query.priority] || 0;
            query.severity = { $gte: minPriority };
        }

        // ─── DATE RANGE FILTER ──────────────────────────────────────────────────
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) {
                query.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        // ─── SEARCH FILTER ──────────────────────────────────────────────────────
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { location: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // ─── SORTING ─────────────────────────────────────────────────────────────
        if (req.query.sort) {
            const sortParam = req.query.sort;
            if (sortParam === 'newest') {
                sortOption = { createdAt: -1 };
            } else if (sortParam === 'oldest') {
                sortOption = { createdAt: 1 };
            } else if (sortParam === 'upvotes') {
                sortOption = { upvotes: -1 };
            } else if (sortParam === 'severity') {
                sortOption = { severity: -1 };
            }
        }

        // ─── PAGINATION ─────────────────────────────────────────────────────────
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // ─── EXECUTE QUERY ──────────────────────────────────────────────────────
        const reports = await Report.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email');

        // Get total count for pagination
        const totalCount = await Report.countDocuments(query);

        return res.status(200).json({
            data: reports,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        return res.status(200).json(report);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching report' });
    }
};

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
    try {
        console.log('DEBUG: Entering createReport');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('DEBUG: Validation Errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, location, coordinates, targetDepartment, category, contactNumber } = req.body;
        console.log('DEBUG: Body Fields:', { title, description, location, targetDepartment, category, contactNumber });

        // Cloudinary puts the URL in req.file.path. Local multer puts in req.file.filename.
        let imageUrl = null;
        if (req.file) {
            if (req.file.path && req.file.path.startsWith('http')) {
                imageUrl = req.file.path;
            } else {
                imageUrl = '/uploads/' + req.file.filename;
            }
            console.log('DEBUG: Image captured:', imageUrl);
        }

        let parsedCoords = coordinates;
        console.log('DEBUG: Received Coordinates:', coordinates);
        if (typeof coordinates === 'string') {
            try {
                parsedCoords = JSON.parse(coordinates);
            } catch (e) {
                console.error("DEBUG: Coords parsing failed", e);
                parsedCoords = null;
            }
        }

        if (!parsedCoords || typeof parsedCoords.lat !== 'number' || typeof parsedCoords.lng !== 'number') {
            console.error('DEBUG: Invalid or missing coordinates:', parsedCoords);
            return res.status(400).json({ message: 'Valid coordinates are required.' });
        }

        // 1. Save initial report
        console.log('DEBUG: Creating report in DB...');
        let report = await Report.create({
            user: req.user._id,
            title: title || 'Report by Citizen',
            description: description || '',
            contactNumber,
            location: location || 'Unknown Location',
            coordinates: parsedCoords,
            locationData: {
                type: 'Point',
                coordinates: [parsedCoords.lng, parsedCoords.lat]
            },
            imageUrl,
            targetDepartment,
            category: category || 'General (AI Pending)',
            issueType: category || 'General (AI Pending)',
            severity: 3 // Default severity, updated by AI later
        });
        console.log('DEBUG: Report created successfully with ID:', report._id);

        // 2. Immediate socket notification (Non-blocking)
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_report', report);
            // New "newIssue" event for the animated heatmap
            io.emit('newIssue', {
                _id: report._id,
                coordinates: report.coordinates,
                issueType: report.issueType,
                severity: report.severity,
                status: report.status,
                createdAt: report.createdAt
            });

            if (report.targetDepartment) {
                io.to(report.targetDepartment).emit('department_alert', {
                    message: `New alert: ${report.category} at ${report.location}`,
                    report: report
                });
            }
        }

        // 3. Trigger AI Analysis in the background (Non-blocking)
        // We do NOT await this, allowing the response to return to the user immediately.
        (async () => {
            try {
                console.log('DEBUG: Starting background AI analysis...');
                const aiResult = await analyzeReport({ title, description, imageUrl });
                
                const finalCategory = aiResult.assignedCategory || 'General';
                const finalSeverity = aiResult.severityScore ? Math.ceil(aiResult.severityScore / 2) : 3;

                console.log('DEBUG: AI Background Results -> Category:', finalCategory, '| Severity:', finalSeverity);

                // Update report with AI results
                const updatedReport = await Report.findByIdAndUpdate(
                    report._id,
                    {
                        aiAnalysis: aiResult,
                        aiProcessedAt: Date.now(),
                        // Apply AI categorization
                        category: finalCategory,
                        issueType: finalCategory,
                        severity: finalSeverity
                    },
                    { new: true }
                );

                console.log('DEBUG: DB Update Successful. New Category:', updatedReport.category);

                // Notify about analysis completion
                if (io) {
                    io.emit('status_updated', updatedReport);
                }

                await sendNotification(updatedReport, aiResult);
                console.log('DEBUG: AI Analysis background job complete for:', report._id);
            } catch (aiError) {
                console.error('DEBUG: Background AI Processing Error:', aiError);
            }
        })();

        return res.status(201).json(report);
    } catch (error) {
        console.error('CRITICAL: Report Creation Error Details:');
        console.error('- Message:', error.message);
        console.error('- Stack:', error.stack);
        return res.status(500).json({ message: 'Error creating report', detail: error.message });
    }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private (Authority only)
const updateReportStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        // Chairman restriction: Global oversight but read-only
        if (req.user.email === 'chairman@gmail.com') {
            return res.status(403).json({ message: 'Chairman account has global oversight but is restricted to Read-Only access.' });
        }

        if (!['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // 1. Find the report first to check jurisdiction and get old status
        const reportToUpdate = await Report.findById(req.params.id);
        if (!reportToUpdate) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const oldStatus = reportToUpdate.status;

        // 2. Granular Jurisdiction Check: Authorities can only update reports in their ward
        if (req.user.role !== 'admin' && reportToUpdate.targetDepartment !== req.user.departmentCode) {
            return res.status(403).json({
                message: `Unauthorized: This report targets '${reportToUpdate.targetDepartment}', but you are assigned to '${req.user.departmentCode}'.`
            });
        }

        // 3. Perform update with optional notes field
        const updateData = { status };
        if (notes) {
            // Store status history
            if (!reportToUpdate.statusHistory) {
                reportToUpdate.statusHistory = [];
            }
            reportToUpdate.statusHistory.push({
                status: oldStatus,
                changedBy: req.user._id,
                changedAt: new Date(),
                notes: notes
            });
            updateData.notes = notes;
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        // 4. Socket.io broadcasts (REAL-TIME UPDATES) ═══════════════════════════════════
        const io = req.app.get('socketio');
        if (io) {
            // Broadcast to all connected clients
            io.emit('status_updated', {
                reportId: report._id,
                status: report.status,
                timestamp: new Date(),
                updatedBy: req.user.name
            });

            // Broadcast to specific department room
            if (report.targetDepartment) {
                io.to(report.targetDepartment).emit('department_status_update', {
                    message: `Report "${report.title}" status updated to ${report.status}`,
                    report: report
                });
            }

            // Broadcast to the citizen who created the report
            if (report.user) {
                io.to(`user_${report.user._id}`).emit('my_report_updated', {
                    reportId: report._id,
                    newStatus: report.status,
                    message: `Your report "${report.title}" has been updated to ${report.status}`
                });
            }

            console.log(`\n📡 Socket.io broadcasts sent for report status update: ${oldStatus} → ${report.status}\n`);
        }

        // 5. Send email notification to citizen (STATUS CHANGE) ════════════════════════
        if (report.user && oldStatus !== status) {
            await sendStatusChangeNotification(
                report,
                oldStatus,
                status,
                req.user.name
            );
        }

        return res.status(200).json({
            message: 'Report status updated successfully and notifications sent',
            report
        });
    } catch (error) {
        console.error('Error updating report status:', error);
        return res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};

// @desc    Get the 2 most recent public reports (no auth needed — for landing page)
// @route   GET /api/reports/public/recent
// @access  Public
const getPublicRecentReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .sort({ createdAt: -1 })
            .limit(2)
            .populate('user', 'name');
        return res.status(200).json(reports);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching recent reports' });
    }
};

// @desc    Get public stats for the landing page
// @route   GET /api/reports/public/stats
// @access  Public
const getPublicStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const resolvedIssues = await Report.countDocuments({ status: 'resolved' });
        const activeCitizens = await User.countDocuments({ role: 'citizen' });
        
        // Reports this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newReportsThisMonth = await Report.countDocuments({ 
            createdAt: { $gte: startOfMonth } 
        });

        return res.status(200).json({
            resolvedIssues,
            activeCitizens,
            newReportsThisMonth
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching public stats' });
    }
};

// @desc    Get top 3 contributors by report count (no auth needed — for landing page)
// @route   GET /api/reports/public/top-contributors
// @access  Public
const getTopContributors = async (req, res) => {
    try {
        const contributors = await Report.aggregate([
            { $match: { user: { $exists: true, $ne: null } } },
            { $group: { _id: '$user', reportCount: { $sum: 1 } } },
            { $sort: { reportCount: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmpty: false } },
            {
                $project: {
                    _id: 1,
                    reportCount: 1,
                    name: '$userInfo.name',
                    email: '$userInfo.email'
                }
            }
        ]);
        return res.status(200).json(contributors);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching top contributors' });
    }
};

module.exports = {
    getReports,
    getReportById,
    createReport,
    createReportValidation,
    updateReportStatus,
    getPublicRecentReports,
    getTopContributors,
    getPublicStats
};
