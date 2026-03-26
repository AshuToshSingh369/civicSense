const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB. Wiping database to clear users and issues...");
    await mongoose.connection.db.dropDatabase();
    console.log("Database wiped successfully. Ready for fresh accounts.");
    process.exit(0);
}).catch(err => {
    console.error("Failed to wipe database:", err);
    process.exit(1);
});
