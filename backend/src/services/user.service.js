const mongoose = require("mongoose");
const userRepository = require("../repositories/user.repository");

const getAllUsers = async () => {
    const users = await userRepository.getAllUsers();

    return users;
};

const getUserById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid user ID");
        error.statusCode = 400;
        throw error;
    }

    const user = await userRepository.getUserById(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

const updateUser = async (id, userData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid user ID");
        error.statusCode = 400;
        throw error;
    }

    const updatedUser = await userRepository.updateUser(id, userData);

    if (!updatedUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return updatedUser;
};

const softDeleteUser = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid user ID");
        error.statusCode = 400;
        throw error;
    }

    const user = await userRepository.softDeleteUser(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser,
};