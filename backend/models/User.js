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
    },
    profilePhoto: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
});






userSchema.index({ role: 1 });


userSchema.index({ departmentCode: 1 });


userSchema.index({ isVerified: 1 });


userSchema.index({ role: 1, departmentCode: 1 });


userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
