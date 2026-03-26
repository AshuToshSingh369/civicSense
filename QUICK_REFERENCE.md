# CivicSense - Quick Reference Guide

## 📁 Project Structure

```
civicsense/
├── backend/
│   ├── config/
│   │   ├── authMiddleware.js        # Auth validation
│   │   ├── db.js                    # MongoDB connection
│   │   ├── passport.js              # OAuth setup
│   │   └── socketHandler.js         # Socket.IO manager (NEW)
│   ├── controllers/
│   │   ├── authController.js        # Auth logic
│   │   └── reportController.js      # Reports + Filters (ENHANCED)
│   ├── models/
│   │   ├── Report.js                # Report schema + indexes (ENHANCED)
│   │   └── User.js                  # User schema + indexes (ENHANCED)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── reportRoutes.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── notificationService.js   # Email + OTP + Status (ENHANCED)
│   ├── tests/                       # NEW - Test suite
│   │   └── api.test.js
│   ├── Dockerfile                   # Production image (NEW)
│   ├── Dockerfile.dev               # Dev image (NEW)
│   ├── jest.config.js               # Test config (NEW)
│   ├── server.js                    # Main server
│   ├── package.json                 # Updated with test deps
│   └── .env.example                 # Config template (NEW)
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── map/
│   │   │   │   ├── BaseMap.tsx
│   │   │   │   ├── HeatmapCluster.tsx    # NEW - Real-time heatmap
│   │   │   │   └── ... other maps
│   │   │   └── ... other components
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   ├── Dockerfile                   # Production image (NEW)
│   ├── Dockerfile.dev               # Dev image (NEW)
│   ├── package.json
│   └── .env.example                 # Config template (NEW)
├── docker-compose.dev.yml           # Dev stack (NEW)
├── docker-compose.prod.yml          # Prod stack (NEW)
├── nginx.conf                       # Reverse proxy (NEW)
├── .dockerignore                    # Docker excludes (NEW)
├── DEPLOYMENT_GUIDE.md              # Setup guide (NEW)
├── IMPLEMENTATION_SUMMARY.md        # Changes summary (NEW)
└── quick-start.sh                   # Setup script (NEW)
```

## 🔄 Key API Endpoints

### Authentication
```
POST   /api/auth/register              # Register user
POST   /api/auth/verify                # Verify OTP
POST   /api/auth/login                 # Login
POST   /api/auth/logout                # Logout (protected)
PUT    /api/auth/profile               # Update profile (protected)
POST   /api/auth/create-authority      # Create authority (admin)
```

### Reports (Protected)
```
GET    /api/reports?status=pending&priority=high&search=pothole&sort=newest
POST   /api/reports                    # Create report
GET    /api/reports/:id                # Get single report
PUT    /api/reports/:id/status         # Update status (authority)
GET    /api/reports/public/recent      # Recent reports (public)
GET    /api/reports/public/top-contributors  # Top users (public)
```

## ⚡ Socket.IO Events

### Listen For (Frontend)
```javascript
socket.on('authenticated', (data) => {})           // Auth confirmed
socket.on('status_updated_global', (data) => {})   # Status changed
socket.on('new_report_global', (data) => {})       # New report
socket.on('heatmap_update', (issue) => {})         # Heatmap data
socket.on('status_update_notification', (d) => {}) # Your report updated
socket.on('department_member_joined', (d) => {})   # Team member online
```

### Emit From (Frontend)
```javascript
socket.emit('authenticate_user', userId)           # Bind socket
socket.emit('join_department', 'DEPT_001')        # Join dept room
socket.emit('leave_department', 'DEPT_001')       # Leave dept room
socket.emit('ping')                               # Heartbeat
```

## 🔧 Common Commands

```bash
# Development
cd backend && npm run dev              # Start backend
cd frontend && npm run dev             # Start frontend

# Testing
npm test                               # Run tests
npm run test:watch                     # Watch mode
npm run test:coverage                  # Coverage report

# Docker
docker-compose -f docker-compose.dev.yml up      # Dev stack
docker-compose -f docker-compose.prod.yml up -d  # Prod stack
docker-compose down                   # Stop all services

# Database
mongosh mongodb://admin:password@localhost:27017/civicsense
db.reports.getIndexes()                # List indexes
db.reports.aggregate([{ $indexStats: {} }])  # Monitor indexes
```

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/civicsense
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
OPENAI_API_KEY=sk-proj-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📊 Database Indexes

### Report Collection (13 indexes)
- `locationData: 2dsphere` - Geospatial queries
- `status: 1` - Status filtering
- `targetDepartment: 1` - Department queries
- `severity: -1` - Priority sorting
- `createdAt: -1` - Time-based queries
- `user: 1` - User's reports
- Composite indexes for complex queries
- Full-text search indexes

### User Collection (6 indexes)
- `email: 1` - Email lookups
- `role: 1` - Role filtering
- `departmentCode: 1` - Department queries
- `isVerified: 1` - Verification status
- Composite indexes for authority filtering

## 🧪 Test Structure

```javascript
describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', () => {})
    it('should reject invalid email', () => {})
    it('should reject password < 8 chars', () => {})
    it('should reject duplicate email', () => {})
  })
})

describe('Report API', () => {
  describe('GET /api/reports', () => {
    it('should get reports for user', () => {})
    it('should filter by status', () => {})
  })
})
```

## 🐳 Docker Services

### Development (docker-compose.dev.yml)
```
MongoDB (27017)
├─ Auto-creates civicsense database
├─ Default user: admin/password
└─ Health check enabled

Backend (5000)
├─ Hot reload with nodemon
├─ Mounts source code
└─ Connected to MongoDB

Frontend (5173)
├─ Vite dev server
├─ Hot module reload
└─ Connected to Backend
```

### Production (docker-compose.prod.yml)
```
MongoDB (27017) - Production config
Backend (5000) - Optimized image
Frontend (3000) - Built & served
Nginx (80/443) - Reverse proxy & SSL
```

## 🔐 Security Features

- ✅ Helmet - HTTP headers
- ✅ Rate limiting - Auth: 5/min, API: 20/sec
- ✅ CORS - Restricted to CLIENT_URL
- ✅ Password hashing - bcryptjs (10 rounds)
- ✅ JWT - 7-day expiration
- ✅ httpOnly cookies - XSS protection
- ✅ Input validation - express-validator
- ✅ SQL/NoSQL injection prevention
- ✅ HSTS headers - Force HTTPS
- ✅ CSP headers - Prevent XSS

## 📱 Real-Time Features

### Notifications
1. **OTP Email** - Registration verification
2. **Status Change** - Report updates to citizens
3. **Critical Alerts** - High-severity AI detections
4. **Heatmap Updates** - Live map visualization

### Socket.IO Rooms
- `user_${userId}` - Individual user updates
- `DEPT_${code}` - Department-specific alerts
- Global broadcasts - All connected clients

## 🚀 Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Change JWT_SECRET to strong random key
- [ ] Use MongoDB Atlas (not local)
- [ ] Enable SSL certificates
- [ ] Configure email credentials (Gmail App Password)
- [ ] Set NODE_ENV=production
- [ ] Update Nginx server_name to your domain
- [ ] Enable rate limiting
- [ ] Set up backup strategy
- [ ] Test disaster recovery

## 🆘 Troubleshooting

### OTP Not Sending
1. Check EMAIL_USER and EMAIL_PASS in `.env`
2. Verify Gmail 2FA is enabled
3. Regenerate App Password at myaccount.google.com/apppasswords
4. Check console logs for transporter errors

### Socket.IO Not Connecting
1. Check browser console for connection errors
2. Verify socket.IO port (5000) is accessible
3. Check CORS configuration
4. Verify client URL matches SERVER_URL + PORT

### Database Connection Failed
1. Ensure MongoDB is running
2. Check MONGO_URI format
3. Verify credentials if using MongoDB Atlas
4. Check firewall rules

### Tests Failing
1. Clear database: `db.dropDatabase()`
2. Regenerate JWT_SECRET
3. Check Node version (need 18+)
4. Run `npm install` in tests directory

## 📞 Support Resources

- Full guide: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Implementation changes: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- Email setup: https://myaccount.google.com/apppasswords
- MongoDB docs: https://docs.mongodb.com/
- Socket.IO docs: https://socket.io/docs/
- Jest testing: https://jestjs.io/

---

**Last Updated:** Feb 23, 2026
**Version:** 1.0.0 Complete
