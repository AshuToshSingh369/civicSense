

const initializeSocketIO = (io) => {
    
    const activeUsers = new Map();
    const departmentRooms = new Map();

    io.on('connection', (socket) => {
        console.log(`\n✅ User connected: ${socket.id}`);

        
        
        socket.on('authenticate_user', (userId) => {
            if (!userId) {
                console.warn('⚠️ Received authenticate_user without userId');
                return;
            }

            
            socket.join(`user_${userId}`);
            activeUsers.set(userId, socket.id);

            console.log(`📌 User authenticated: ${userId} (Socket: ${socket.id})`);
            
            
            socket.emit('authenticated', { success: true, userId });
        });

        
        
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
            
            
            io.to(deptCode).emit('department_member_joined', {
                message: `New team member connected`,
                departmentCode: deptCode,
                totalMembers: members.length
            });
        });

        
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

        

        
        socket.on('new_report_alert', (report) => {
            console.log(`\n🚨 Broadcasting new report to ${report.targetDepartment || 'all'}`);
            
            if (report.targetDepartment) {
                
                io.to(report.targetDepartment).emit('new_report_in_department', {
                    message: `New ${report.category} report at ${report.location}`,
                    report: report,
                    severity: report.severity,
                    threatLevel: report.aiAnalysis?.threatLevel || 'Unknown'
                });
            }

            
            io.emit('new_report_global', {
                reportId: report._id,
                coordinates: report.coordinates,
                issueType: report.issueType,
                severity: report.severity,
                status: report.status,
                createdAt: report.createdAt
            });
        });

        

        
        socket.on('report_status_changed', (data) => {
            const { reportId, oldStatus, newStatus, targetDepartment, userId } = data;

            console.log(`\n📊 Broadcasting status change: ${reportId} (${oldStatus} → ${newStatus})`);

            
            if (userId) {
                io.to(`user_${userId}`).emit('status_update_notification', {
                    reportId,
                    oldStatus,
                    newStatus,
                    message: `Your report status changed to ${newStatus}`
                });
            }

            
            if (targetDepartment) {
                io.to(targetDepartment).emit('department_status_update', {
                    reportId,
                    newStatus,
                    message: `Report status updated to ${newStatus}`
                });
            }

            
            io.emit('status_updated_global', {
                reportId,
                newStatus,
                timestamp: new Date()
            });
        });

        

        
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

        

        
        socket.on('request_dashboard_stats', (deptCode) => {
            console.log(`📈 Dashboard stats requested for: ${deptCode || 'all'}`);
            
            
            socket.emit('dashboard_stats', {
                deptCode,
                
            });
        });

        

        socket.on('error', (error) => {
            console.error(`❌ Socket error (${socket.id}):`, error);
        });

        socket.on('disconnect', () => {
            
            activeUsers.forEach((sockId, userId) => {
                if (sockId === socket.id) {
                    activeUsers.delete(userId);
                    console.log(`👤 User ${userId} disconnected`);
                }
            });

            
            departmentRooms.forEach((members, deptCode) => {
                const index = members.indexOf(socket.id);
                if (index > -1) {
                    members.splice(index, 1);
                    console.log(`🚪 Disconnected from ${deptCode} (Members remaining: ${members.length})`);
                }
            });

            console.log(`❌ User disconnected: ${socket.id}`);
        });

        
        
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
