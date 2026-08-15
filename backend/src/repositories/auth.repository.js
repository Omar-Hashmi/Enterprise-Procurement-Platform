const User = require("../models/user.model");

const register = async (userData) => {
    const existingUser = await User.findOne({
        email: userData.email,
    });

    if (existingUser) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
    }

    try {
        const user = await User.create(userData);
        user.password = undefined;
        return user;
    } catch (err) {
        if (err.code === 11000) {
            const error = new Error("Email already exists");
            error.statusCode = 409;
            throw error;
        }
        if (err.name === "ValidationError") {
            const error = new Error(err.message);
            error.statusCode = 400;
            throw error;
        }
        throw err;
    }
};

const login = async (userData) => {
    const user = await User.findOne({
        email: userData.email,
    });

    return user;
};

module.exports = {
    register,
    login,
};