/**
 * Socket.IO Event Handlers
 * Real-time communication for CivicSense platform
 */

const initializeSocketIO = (io) => {
    // Track active users by their ID
    const activeUsers = new Map();
    const departmentRooms = new Map();

    io.on('connection', (socket) => {
        console.log(`\n✅ User connected: ${socket.id}`);

        // ─── USER IDENTIFICATION ─────────────────────────────────────────────────────
        // Called when user authenticates to bind their socket to their user ID
        socket.on('authenticate_user', (userId) => {
            if (!userId) {
                console.warn('⚠️ Received authenticate_user without userId');
                return;
            }

            // Join a personal room for this user
            socket.join(`user_${userId}`);
            activeUsers.set(userId, socket.id);

            console.log(`📌 User authenticated: ${userId} (Socket: ${socket.id})`);
            
            // Emit confirmation to the client
            socket.emit('authenticated', { success: true, userId });
        });

        // ─── DEPARTMENT ROOM MANAGEMENT ──────────────────────────────────────────────
        // Authority joins their department's room to receive alerts
        socket.on('join_department', (deptCode) => {
            if (!deptCode) {
                console.warn('⚠️ Received join_department without deptCode');
                return;
            }

            socket.join(deptCode);
            
            if (!departmentRooms.has(deptCode)) {
                departmentRooms.set(deptCode, []);
            }
            const members = departmentRooms.get(deptCode);
            if (!members.includes(socket.id)) {
                members.push(socket.id);
            }

            console.log(`🏢 Socket joined department: ${deptCode} (Members: ${members.length})`);
            
            // Notify others in the department
            io.to(deptCode).emit('department_member_joined', {
                message: `New team member connected`,
                departmentCode: deptCode,
                totalMembers: members.length
            });
        });

        // Leave department room
        socket.on('leave_department', (deptCode) => {
            socket.leave(deptCode);
            
            if (departmentRooms.has(deptCode)) {
                const members = departmentRooms.get(deptCode);
                const index = members.indexOf(socket.id);
                if (index > -1) {
                    members.splice(index, 1);
                }
            }

            console.log(`🚪 Socket left department: ${deptCode}`);
        });

        // ─── REAL-TIME NOTIFICATIONS ────────────────────────────────────────────────

        // Listen for new report creation (emitted from reportController)
        socket.on('new_report_alert', (report) => {
            console.log(`\n🚨 Broadcasting new report to ${report.targetDepartment || 'all'}`);
            
            if (report.targetDepartment) {
                // Send to specific department
                io.to(report.targetDepartment).emit('new_report_in_department', {
                    message: `New ${report.category} report at ${report.location}`,
                    report: report,
                    severity: report.severity,
                    threatLevel: report.aiAnalysis?.threatLevel || 'Unknown'
                });
            }

            // Broadcast to all (for heatmap real-time updates)
            io.emit('new_report_global', {
                reportId: report._id,
                coordinates: report.coordinates,
                issueType: report.issueType,
                severity: report.severity,
                status: report.status,
                createdAt: report.createdAt
            });
        });

        // ─── STATUS UPDATE BROADCASTS ───────────────────────────────────────────────

        // Broadcast status update to interested parties
        socket.on('report_status_changed', (data) => {
            const { reportId, oldStatus, newStatus, targetDepartment, userId } = data;

            console.log(`\n📊 Broadcasting status change: ${reportId} (${oldStatus} → ${newStatus})`);

            // Notify the citizen who created the report
            if (userId) {
                io.to(`user_${userId}`).emit('status_update_notification', {
                    reportId,
                    oldStatus,
                    newStatus,
                    message: `Your report status changed to ${newStatus}`
                });
            }

            // Notify the department
            if (targetDepartment) {
                io.to(targetDepartment).emit('department_status_update', {
                    reportId,
                    newStatus,
                    message: `Report status updated to ${newStatus}`
                });
            }

            // Global broadcast for dashboards
            io.emit('status_updated_global', {
                reportId,
                newStatus,
                timestamp: new Date()
            });
        });

        // ─── HEATMAP DATA STREAMING ─────────────────────────────────────────────────

        // New issue for heatmap visualization
        socket.on('heatmap_new_issue', (issueData) => {
            console.log(`🔥 New heatmap issue: ${issueData.issueType} at coordinates`);
            
            io.emit('heatmap_update', {
                _id: issueData._id,
                coordinates: issueData.coordinates,
                issueType: issueData.issueType,
                severity: issueData.severity,
                status: issueData.status,
                createdAt: issueData.createdAt
            });
        });

        // ─── DASHBOARD ANALYTICS ────────────────────────────────────────────────────

        // Request dashboard stats (admin/authority only)
        socket.on('request_dashboard_stats', (deptCode) => {
            console.log(`📈 Dashboard stats requested for: ${deptCode || 'all'}`);
            
            // This would typically fetch from DB and emit
            socket.emit('dashboard_stats', {
                deptCode,
                // Stats would be added here by the application
            });
        });

        // ─── ERROR HANDLING & DISCONNECTION ──────────────────────────────────────────

        socket.on('error', (error) => {
            console.error(`❌ Socket error (${socket.id}):`, error);
        });

        socket.on('disconnect', () => {
            // Remove from active users
            activeUsers.forEach((sockId, userId) => {
                if (sockId === socket.id) {
                    activeUsers.delete(userId);
                    console.log(`👤 User ${userId} disconnected`);
                }
            });

            // Remove from department rooms
            departmentRooms.forEach((members, deptCode) => {
                const index = members.indexOf(socket.id);
                if (index > -1) {
                    members.splice(index, 1);
                    console.log(`🚪 Disconnected from ${deptCode} (Members remaining: ${members.length})`);
                }
            });

            console.log(`❌ User disconnected: ${socket.id}`);
        });

        // ─── PING/HEARTBEAT ─────────────────────────────────────────────────────────
        // Keep connection alive
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });

    console.log('\n✅ Socket.IO initialized successfully');
    return {
        getActiveUsers: () => activeUsers,
        getDepartmentRooms: () => departmentRooms
    };
};

module.exports = initializeSocketIO;
