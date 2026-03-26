const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: function () {
            // Password is required only if the user does NOT have a googleId
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['citizen', 'admin', 'authority'],
        default: 'citizen'
    },
    departmentCode: {
        type: String,
        required: false
    },
    homeDepartment: {
        type: String,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expires: Date
    }

}, {
    timestamps: true
});

// ─── DATABASE INDEXES FOR PERFORMANCE OPTIMIZATION ─────────────────────────────
// Note: email index is automatically created by "unique: true" constraint
// Do not add explicit index here to avoid duplication

// Role-based queries (filtering by user type)
userSchema.index({ role: 1 });

// Department filtering for authority dashboards
userSchema.index({ departmentCode: 1 });

// Verification status queries
userSchema.index({ isVerified: 1 });

// Composite index for authority filtering
userSchema.index({ role: 1, departmentCode: 1 });

// Time-based queries for user analytics
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
