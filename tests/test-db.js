const mongoose = require("mongoose");
require("dotenv").config();

const connectTestDb = async () => {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGO_URI is required for tests");
    }

    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(uri);
    }

    return uri;
};

const disconnectTestDb = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};

module.exports = {
    connectTestDb,
    disconnectTestDb,
};