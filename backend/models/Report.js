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
        required: [true, 'Please add a description']
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
