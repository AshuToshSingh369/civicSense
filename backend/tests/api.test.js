/**
 * CivicSense Backend - Unit Tests
 * Jest + Supertest
 * 
 * Run tests: npm test
 * Run tests with coverage: npm test -- --coverage
 */

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Report = require('../models/Report');

// Mock express app for testing
let app;

beforeAll(async () => {
    // Connect to test database
    if (process.env.NODE_ENV !== 'test') {
        process.env.NODE_ENV = 'test';
        process.env.MONGO_URI = 'mongodb://localhost:27017/civicsense_test';
        process.env.JWT_SECRET = 'test_secret';
    }

    // Initialize app
    app = require('../server');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for server startup
});

afterAll(async () => {
    // Clean up test database
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Report.deleteMany({});
});

// ─── AUTHENTICATION TESTS ─────────────────────────────────────────────────────

describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new citizen user', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'securePassword123',
                homeDepartment: 'City Hall'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.message).toBe('Registration successful. Please verify your email.');
            expect(response.body.email).toBe(userData.email);
        });

        it('should reject invalid email', async () => {
            const userData = {
                name: 'Jane Doe',
                email: 'invalid-email',
                password: 'securePassword123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toContain('email');
        });

        it('should reject password shorter than 8 characters', async () => {
            const userData = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'short'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toContain('at least 8 characters');
        });

        it('should reject duplicate email', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'securePassword123'
            };

            // First registration
            await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Duplicate registration
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const salt = await require('bcryptjs').genSalt(10);
            const hashedPassword = await require('bcryptjs').hash('securePassword123', salt);

            await User.create({
                name: 'John Doe',
                email: 'john@example.com',
                password: hashedPassword,
                isVerified: true,
                role: 'citizen'
            });
        });

        it('should login user with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'securePassword123'
                })
                .expect(200);

            expect(response.body.name).toBe('John Doe');
            expect(response.body.role).toBe('citizen');
        });

        it('should reject wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'wrongPassword'
                })
                .expect(401);

            expect(response.body.message).toContain('Invalid');
        });

        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'somePassword123'
                })
                .expect(404);

            expect(response.body.message).toContain('not found');
        });
    });
});

// ─── REPORT TESTS ─────────────────────────────────────────────────────────────

describe('Report API', () => {
    let token;
    let userId;
    let authorityToken;
    let authorityId;

    beforeEach(async () => {
        // Create citizen user
        const salt = await require('bcryptjs').genSalt(10);
        const hashedPassword = await require('bcryptjs').hash('securePassword123', salt);

        const citizenUser = await User.create({
            name: 'John Citizen',
            email: 'citizen@example.com',
            password: hashedPassword,
            isVerified: true,
            role: 'citizen'
        });

        userId = citizenUser._id;

        // Create authority user
        const authorityUser = await User.create({
            name: 'Jane Authority',
            email: 'authority@example.com',
            password: hashedPassword,
            isVerified: true,
            role: 'authority',
            departmentCode: 'DEPT001'
        });

        authorityId = authorityUser._id;

        // Generate tokens (simplified - in real tests, use actual auth)
        const jwt = require('jsonwebtoken');
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        authorityToken = jwt.sign({ id: authorityId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    });

    describe('GET /api/reports/public/recent', () => {
        it('should get 2 most recent reports without auth', async () => {
            await Report.create([
                {
                    title: 'Pothole in Street',
                    description: 'There is a large pothole on Main Street',
                    location: 'Main Street',
                    targetDepartment: 'DEPT001',
                    category: 'Road Damage',
                    coordinates: { lat: 28.3949, lng: 84.1240 },
                    locationData: {
                        type: 'Point',
                        coordinates: [84.1240, 28.3949]
                    },
                    user: userId
                },
                {
                    title: 'Broken Streetlight',
                    description: 'Streetlight not working at intersection',
                    location: 'Park Avenue',
                    targetDepartment: 'DEPT001',
                    category: 'Lighting',
                    coordinates: { lat: 28.3950, lng: 84.1250 },
                    locationData: {
                        type: 'Point',
                        coordinates: [84.1250, 28.3950]
                    },
                    user: userId
                }
            ]);

            const response = await request(app)
                .get('/api/reports/public/recent')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeLessThanOrEqual(2);
        });
    });

    describe('GET /api/reports', () => {
        it('should get reports for authenticated user', async () => {
            await Report.create({
                title: 'Test Report',
                description: 'This is a test report description',
                location: 'Test Location',
                targetDepartment: 'DEPT001',
                category: 'Test',
                coordinates: { lat: 28.3949, lng: 84.1240 },
                locationData: {
                    type: 'Point',
                    coordinates: [84.1240, 28.3949]
                },
                user: userId
            });

            const response = await request(app)
                .get('/api/reports')
                .set('Cookie', `accessToken=${token}`)
                .expect(200);

            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should filter reports by status', async () => {
            await Report.create([
                {
                    title: 'Pending Report',
                    description: 'A report waiting for review',
                    location: 'Location 1',
                    targetDepartment: 'DEPT001',
                    category: 'Test',
                    status: 'pending',
                    coordinates: { lat: 28.3949, lng: 84.1240 },
                    locationData: {
                        type: 'Point',
                        coordinates: [84.1240, 28.3949]
                    },
                    user: userId
                },
                {
                    title: 'Resolved Report',
                    description: 'A report that has been resolved',
                    location: 'Location 2',
                    targetDepartment: 'DEPT001',
                    category: 'Test',
                    status: 'resolved',
                    coordinates: { lat: 28.3950, lng: 84.1250 },
                    locationData: {
                        type: 'Point',
                        coordinates: [84.1250, 28.3950]
                    },
                    user: userId
                }
            ]);

            const response = await request(app)
                .get('/api/reports?status=pending')
                .set('Cookie', `accessToken=${token}`)
                .expect(200);

            expect(response.body.data.every(r => r.status === 'pending')).toBe(true);
        });
    });

    describe('PUT /api/reports/:id/status', () => {
        it('should update report status for authority', async () => {
            const report = await Report.create({
                title: 'Test Report',
                description: 'This is a test report',
                location: 'Test Location',
                targetDepartment: 'DEPT001',
                category: 'Test',
                status: 'pending',
                coordinates: { lat: 28.3949, lng: 84.1240 },
                locationData: {
                    type: 'Point',
                    coordinates: [84.1240, 28.3949]
                },
                user: userId
            });

            const response = await request(app)
                .put(`/api/reports/${report._id}/status`)
                .set('Cookie', `accessToken=${authorityToken}`)
                .send({ status: 'in-progress' })
                .expect(200);

            expect(response.body.report.status).toBe('in-progress');
        });

        it('should reject invalid status', async () => {
            const report = await Report.create({
                title: 'Test Report',
                description: 'This is a test report',
                location: 'Test Location',
                targetDepartment: 'DEPT001',
                category: 'Test',
                coordinates: { lat: 28.3949, lng: 84.1240 },
                locationData: {
                    type: 'Point',
                    coordinates: [84.1240, 28.3949]
                },
                user: userId
            });

            const response = await request(app)
                .put(`/api/reports/${report._id}/status`)
                .set('Cookie', `accessToken=${authorityToken}`)
                .send({ status: 'invalid_status' })
                .expect(400);

            expect(response.body.message).toContain('Invalid');
        });
    });
});

module.exports = {}; // Export for Jest
