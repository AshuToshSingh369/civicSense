


const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved'],
        default: 'pending'
    },
    category: {
        type: String,
        required: true
    },

    
    
    
    
    
    
    
    locationData: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        
        coordinates: {
            type: [Number],
            required: true
        },
        
        addressName: {
            type: String
        }
    },

    imageUrl: {
        type: String
    },
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetDepartment: {
        type: String,
        required: true
    }
}, { timestamps: true });


issueSchema.index({ locationData: '2dsphere' });


issueSchema.index({ 'locationData': '2dsphere', 'status': 1 });

module.exports = mongoose.model('Issue', issueSchema);


