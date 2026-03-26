const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Can be anonymous or referenced
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: false // Made optional as we rely on AI detection and contact number
    },
    contactNumber: {
        type: String,
        required: [true, 'Please add a contact number'],
        match: [/^\d{10}$/, 'Contact number must be exactly 10 digits']
    },
    category: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    imageUrl: {
        type: String,
        required: false
    },
    targetDepartment: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    upvotes: {
        type: Number,
        default: 0
    },
    aiAnalysis: {
        threatLevel: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical', 'Unknown'],
            default: 'Unknown'
        },
        severityScore: {
            type: Number,
            min: 0,
            max: 10,
            default: 0
        },
        detectedObjects: [String],
        confidence: {
            type: Number,
            default: 0
        },
        isDuplicate: {
            type: Boolean,
            default: false
        },
        flaggedForReview: {
            type: Boolean,
            default: false
        }
    },
    aiProcessedAt: {
        type: Date
    },
    // GeoJSON for heatmap and spatial queries
    locationData: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    issueType: {
        type: String,
        default: 'General'
    },
    severity: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    statusHistory: [{
        status: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        notes: String
    }],
    notes: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// ─── DATABASE INDEXES FOR PERFORMANCE OPTIMIZATION ─────────────────────────────
// Geospatial index for location-based queries (heatmap, nearby reports)
reportSchema.index({ locationData: '2dsphere' });

// Status filtering (most common query in dashboards)
reportSchema.index({ status: 1 });

// Department-based filtering for authority dashboards
reportSchema.index({ targetDepartment: 1 });

// Combined index for dashboard queries (department + status)
reportSchema.index({ targetDepartment: 1, status: 1 });

// Time-based queries (recent reports)
reportSchema.index({ createdAt: -1 });

// User-based queries (citizen's own reports)
reportSchema.index({ user: 1 });

// Severity-based queries (high priority reports)
reportSchema.index({ severity: -1 });

// Full-text search index on title and description
reportSchema.index({ title: 'text', description: 'text', location: 'text' });

// Composite index for complex queries
reportSchema.index({ targetDepartment: 1, status: 1, severity: -1, createdAt: -1 });

// AI Analysis queries
reportSchema.index({ 'aiAnalysis.threatLevel': 1 });
reportSchema.index({ 'aiAnalysis.severityScore': -1 });

module.exports = mongoose.model('Report', reportSchema);
