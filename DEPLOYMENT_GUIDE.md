# 🚀 CivicSense - Complete Setup & Deployment Guide

## 📋 Table of Contents

1. [Quick Start (Development)](#quick-start-development)
2. [Email Configuration (Setup OTP)](#email-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Testing](#testing)
5. [Database Optimization](#database-optimization)
6. [Socket.IO Real-Time Features](#socketio-real-time-features)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start (Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd civicsense

# 2. Setup Backend
cd backend
cp .env.example .env
npm install
npm run dev

# 3. Setup Frontend (in a new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Access the application at: `http://localhost:5173`

---

## 📧 Email Configuration (FIX OTP ISSUE)

### Step 1: Enable Gmail App Password

1. **Enable 2-Factor Authentication**
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Navigate to **Security** (left sidebar)
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Click "Generate"
   - Copy the 16-character password

3. **Update `.env` file**

```env
# backend/.env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # 16-character password from Google
ALERT_EMAIL=authority@gmail.com  # Email to send critical alerts

# Frontend
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Step 2: Test Email Sending

```bash
cd backend
npm run dev
```

Register a new user → Check console logs for:
```
📧 [OTP SENT] To: user@example.com | Code: 123456 | Expires in 10 minutes
✅ OTP email sent successfully. Message ID: <msg-id>
```

If you see the email address logged but not the "email sent" message, check:
- Gmail 2FA is enabled
- App Password is correct (no spaces)
- EMAIL_USER is your full Gmail address
- Less secure apps are restricted (this is normal with App Passwords)

---

## 🐳 Docker Deployment

### Development Environment

```bash
# Copy environment file
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env with your credentials
nano backend/.env

# Start all services
docker-compose -f docker-compose.dev.yml up --build

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Production Environment

```bash
# Setup production env variables
cp backend/.env.example backend/.env.prod
nano backend/.env.prod  # Add production values

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Stop services
docker-compose -f docker-compose.prod.yml down
```

**Production Security Checklist:**
- [ ] Change JWT_SECRET to a strong random key
- [ ] Use MongoDB Atlas instead of local MongoDB
- [ ] Enable SSL/TLS certificates
- [ ] Configure rate limiting appropriately
- [ ] Set NODE_ENV=production
- [ ] Use strong email passwords
- [ ] Enable CORS properly for your domain

---

## 🧪 Testing

### Unit Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- Authentication (register, login, OTP verification)
- Report creation and filtering
- Status updates and permissions
- Database queries and indexing

### Manual API Testing

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "homeDepartment": "City Hall"
  }'

# Verify OTP
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "123456"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# Get reports with filters
curl http://localhost:5000/api/reports?status=pending&sort=newest \
  -H "Cookie: accessToken=<your-token>"

# Update report status
curl -X PUT http://localhost:5000/api/reports/<reportId>/status \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<your-token>" \
  -d '{
    "status": "in-progress",
    "notes": "Team dispatched to location"
  }'
```

---

## ⚡ Database Optimization

### Added Indexes

The system now includes optimized indexes for:

**Report Collection:**
- Geospatial index on `locationData` (2dsphere) - for heatmap queries
- Status filtering (pending, in-progress, resolved, rejected)
- Department-based queries
- Combined index for dashboard (department + status + severity)
- Time-based queries (createdAt)
- Full-text search on title, description, location
- AI analysis filtering

**User Collection:**
- Email lookups
- Role-based filtering
- Department codes
- Verification status
- Composite indexes for authority filtering

**Automatic Index Creation:**
Indexes are created automatically when models load in MongoDB.

**Monitor Indexes:**
```bash
# Connect to MongoDB
mongosh mongodb://admin:password@localhost:27017/civicsense

# List all indexes
db.reports.getIndexes()
db.users.getIndexes()

# Check index usage statistics
db.reports.aggregate([{ $indexStats: {} }])
```

---

## 🔌 Socket.IO Real-Time Features

### Client-Side Integration

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Authenticate
socket.emit('authenticate_user', userId);

// Join department room
socket.emit('join_department', 'DEPT_001');

// Listen for real-time updates
socket.on('status_update_notification', (data) => {
  console.log('Report status changed:', data);
});

socket.on('new_report_in_department', (data) => {
  console.log('New report in your department:', data);
});

socket.on('heatmap_update', (issue) => {
  console.log('New issue for map:', issue);
});
```

### Server-Side Events

**Emitted by Backend:**
- `authenticated` - User authentication confirmed
- `status_updated_global` - Any status change
- `status_update_notification` - For specific user
- `new_report_global` - New report globally
- `new_report_in_department` - New report for department
- `department_member_joined` - Team member connected
- `heatmap_update` - Real-time heatmap data

**Listened by Backend:**
- `authenticate_user` - Bind socket to user ID
- `join_department` - Join department room
- `leave_department` - Leave department room
- `new_report_alert` - New report notification
- `report_status_changed` - Status update broadcast
- `ping` - Heartbeat

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new citizen | No |
| POST | `/api/auth/verify` | Verify OTP | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/create-authority` | Create authority | Admin |

### Report Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/reports` | Get reports with filters | `status`, `department`, `priority`, `search`, `sort`, `page`, `limit` |
| GET | `/api/reports/:id` | Get single report | - |
| POST | `/api/reports` | Create report | - |
| PUT | `/api/reports/:id/status` | Update status | - |
| GET | `/api/reports/public/recent` | Recent reports (public) | - |
| GET | `/api/reports/public/top-contributors` | Top contributors (public) | - |

### Query Examples

```bash
# Get pending reports in specific department
GET /api/reports?status=pending&department=DEPT001

# Get high priority reports, sorted by severity
GET /api/reports?priority=high&sort=severity

# Search for pothole reports
GET /api/reports?search=pothole

# Get paginated results
GET /api/reports?page=2&limit=10&sort=newest
```

---

## 🔧 Troubleshooting

### OTP Email Not Sending

**Issue:** Users don't receive OTP emails

**Solutions:**
1. Check `.env` file has EMAIL_USER and EMAIL_PASS
2. Verify Gmail 2FA is enabled
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and regenerate
4. Check console logs:
   ```
   ✅ Email transporter initialized with Gmail
   ✅ Email transporter verified successfully
   ```
5. If missing credentials:
   ```
   ⚠️ Email credentials not found. OTP/Email notifications will be logged only.
   ```

### MongoDB Connection Issues

```bash
# Test connection
mongosh mongodb://admin:password@localhost:27017/civicsense

# If using Docker
docker exec civicsense_mongodb mongosh --username admin --password password

# Check if indexes are created
db.reports.getIndexes()
```

### Socket.IO Not Connecting

**Debug in Browser Console:**
```javascript
// Check socket connection
console.log(socket.connected); // Should be true
console.log(socket.id); // Should have an ID

// Listen for connection events
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
socket.on('connect_error', (error) => console.error('Error:', error));
```

### Performance Issues

1. **Enable Database Profiling:**
   ```bash
   mongosh
   db.setProfilingLevel(1, { slowms: 100 })
   db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
   ```

2. **Check Index Usage:**
   ```bash
   db.reports.explain("executionStats").find({ status: "pending" })
   ```

3. **Monitor Memory:**
   ```bash
   docker stats civicsense_backend
   ```

---

## 📞 Support & Contact

For issues or questions:
1. Check the Troubleshooting section
2. Review API documentation
3. Check Socket.IO logs in browser console
4. Verify .env configuration

**Key Files to Check:**
- `backend/.env` - Configuration
- `backend/logs/` - Server logs
- Browser Developer Tools → Network & Console tabs

---

**Last Updated:** Feb 23, 2026
**Version:** 1.0.0
