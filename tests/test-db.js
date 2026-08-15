const mongoose = require("../backend/node_modules/mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectTestDb = async () => {
    if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
    }

    const uri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(uri);
    }

    return uri;
};

const disconnectTestDb = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
};

module.exports = {
    connectTestDb,
    disconnectTestDb,
};