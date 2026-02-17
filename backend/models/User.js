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
        required: [true, 'Please add a password']
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

module.exports = mongoose.model('User', userSchema);
