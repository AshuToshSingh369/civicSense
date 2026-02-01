const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Report = require('./models/Report');

async function checkReports() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const reports = await Report.find();
        console.log('--- Reports in DB ---');
        reports.forEach(r => {
            console.log(`ID: ${r._id} | Status: ${r.status} | Title: ${r.title}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

checkReports();
