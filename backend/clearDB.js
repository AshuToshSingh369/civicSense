const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for cleanup...');

        // Clear Users
        await mongoose.connection.db.collection('users').deleteMany({});
        console.log('All Users cleared.');

        // Clear Reports
        await mongoose.connection.db.collection('reports').deleteMany({});
        console.log('All Reports cleared.');

        console.log('Database Cleanup Successful.');
        process.exit();
    } catch (error) {
        console.error('Cleanup Failed:', error);
        process.exit(1);
    }
};

clearData();
