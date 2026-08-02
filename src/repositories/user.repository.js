const User = require("../models/user.model");

const getAllUsers = async () => {
    const users = await User.find().select("-password");

    return users;
};

const getUserById = async (id) => {
    const user = await User.findById(id).select("-password");

    return user;
};

const updateUser = async (id, userData) => {
    const updatedUser = await User.findByIdAndUpdate(
        id,
        userData,
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");

    return updatedUser;
};

const softDeleteUser = async (id) => {
    const user = await User.findByIdAndUpdate(
        id,
        {
            isActive: false,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");

    return user;
};

const activateUser = async (id) => {
    const user = await User.findByIdAndUpdate(
        id,
        {
            isActive: true,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");

    return user;
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser,
    activateUser,
};