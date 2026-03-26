const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Report = require('./models/Report');
const fs = require('fs');

dotenv.config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let output = '--- Users ---\n';
        const users = await User.find({}, { email: 1, role: 1, departmentCode: 1 });
        users.forEach(u => {
            output += `Email: ${u.email}, Role: ${u.role}, Dept: ${u.departmentCode}\n`;
        });

        output += '\n--- Reports ---\n';
        const count = await Report.countDocuments({});
        output += `Total Reports in DB: ${count}\n`;
        const reports = await Report.find({}, { title: 1, targetDepartment: 1, location: 1 });
        reports.forEach(r => {
            output += `Title: ${r.title}, TargetDept: ${r.targetDepartment}, Location: ${r.location}\n`;
        });

        fs.writeFileSync('db_state.txt', output);
        console.log('Output written to db_state.txt');
    } catch (e) {
        fs.writeFileSync('db_state.txt', e.stack);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkDB();
