const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Report = require('./models/Report');

dotenv.config();

async function migrateReports() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Connected to DB ---');

        const reports = await Report.find({});
        console.log(`Checking ${reports.length} reports...`);

        let updatedCount = 0;
        for (const report of reports) {
            const target = report.targetDepartment;
            if (target && target.includes(',')) {
                const cleanCode = target.split(',')[0].trim();
                console.log(`Updating Report #${report._id}: "${target}" -> "${cleanCode}"`);

                await Report.findByIdAndUpdate(report._id, { targetDepartment: cleanCode });
                updatedCount++;
            }
        }

        console.log(`\nMigration Complete: ${updatedCount} reports updated.`);
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

migrateReports();
