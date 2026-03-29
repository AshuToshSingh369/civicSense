const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const { analyzeReport } = require('../services/aiService');
const { sendNotification, sendStatusChangeNotification } = require('../services/notificationService');



const createReportValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('contactNumber').trim().matches(/^\d{10}$/).withMessage('Contact number must be exactly 10 digits'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('targetDepartment').trim().notEmpty().withMessage('Target department is required'),
    body('category').optional().trim(),
];






const getReports = async (req, res) => {
    try {
        let query = {};
        let sortOption = { createdAt: -1 }; 

        
        const isGlobalUser = req.user.role === 'admin' || req.user.email === 'chairman@gmail.com';

        if (!isGlobalUser && req.user.role === 'authority') {
            query.targetDepartment = req.user.departmentCode;
        } else if (!isGlobalUser && req.user.role === 'citizen') {
            
            query.user = req.user._id;
        }

        
        if (req.query.status) {
            const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
            if (validStatuses.includes(req.query.status)) {
                query.status = req.query.status;
            }
        }

        
        if (req.query.department && isGlobalUser) {
            query.targetDepartment = req.query.department;
        }

        
        if (req.query.priority) {
            const priorityMap = { low: 1, medium: 2, high: 3, critical: 4 };
            const minPriority = priorityMap[req.query.priority] || 0;
            query.severity = { $gte: minPriority };
        }

        
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) {
                query.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { location: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        
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

        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        
        const reports = await Report.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email');

        
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
            severity: 3 
        });
        console.log('DEBUG: Report created successfully with ID:', report._id);

        
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_report', report);
            
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

        
        
        (async () => {
            try {
                console.log('DEBUG: Starting background AI analysis...');
                const aiResult = await analyzeReport({ title, description, imageUrl });
                
                const finalCategory = aiResult.assignedCategory || 'General';
                const finalSeverity = aiResult.severityScore ? Math.ceil(aiResult.severityScore / 2) : 3;

                console.log('DEBUG: AI Background Results -> Category:', finalCategory, '| Severity:', finalSeverity);

                
                const updatedReport = await Report.findByIdAndUpdate(
                    report._id,
                    {
                        aiAnalysis: aiResult,
                        aiProcessedAt: Date.now(),
                        
                        category: finalCategory,
                        issueType: finalCategory,
                        severity: finalSeverity
                    },
                    { new: true }
                );

                console.log('DEBUG: DB Update Successful. New Category:', updatedReport.category);

                
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




const updateReportStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        
        if (req.user.email === 'chairman@gmail.com') {
            return res.status(403).json({ message: 'Chairman account has global oversight but is restricted to Read-Only access.' });
        }

        if (!['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        
        const reportToUpdate = await Report.findById(req.params.id);
        if (!reportToUpdate) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const oldStatus = reportToUpdate.status;

        
        if (req.user.role !== 'admin' && reportToUpdate.targetDepartment !== req.user.departmentCode) {
            return res.status(403).json({
                message: `Unauthorized: This report targets '${reportToUpdate.targetDepartment}', but you are assigned to '${req.user.departmentCode}'.`
            });
        }

        
        const updateData = { status };
        if (notes) {
            
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

        
        const io = req.app.get('socketio');
        if (io) {
            
            io.emit('status_updated', {
                reportId: report._id,
                status: report.status,
                timestamp: new Date(),
                updatedBy: req.user.name
            });

            
            if (report.targetDepartment) {
                io.to(report.targetDepartment).emit('department_status_update', {
                    message: `Report "${report.title}" status updated to ${report.status}`,
                    report: report
                });
            }

            
            if (report.user) {
                io.to(`user_${report.user._id}`).emit('my_report_updated', {
                    reportId: report._id,
                    newStatus: report.status,
                    message: `Your report "${report.title}" has been updated to ${report.status}`
                });
            }

            console.log(`\n📡 Socket.io broadcasts sent for report status update: ${oldStatus} → ${report.status}\n`);
        }

        
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




const getPublicStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const resolvedIssues = await Report.countDocuments({ status: 'resolved' });
        const activeCitizens = await User.countDocuments({ role: 'citizen' });
        
        
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
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: false } },
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
