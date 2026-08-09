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

    const setResetToken = async (userId, token, expires) => {
        return await User.findByIdAndUpdate(userId, {
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        }, { new: true }).select('-password');
    };

    const findByResetToken = async (token) => {
        return await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('-password');
    };

    const clearResetToken = async (userId) => {
        return await User.findByIdAndUpdate(userId, {
            $set: { resetPasswordToken: null, resetPasswordExpires: null },
        }, { new: true }).select('-password');
    };

    const getUserByIdWithPassword = async (id) => {
        return await User.findById(id);
    };

    module.exports = {
        getAllUsers,
        getUserById,
        getUserByIdWithPassword,
        updateUser,
        softDeleteUser,
        activateUser,
        setResetToken,
        findByResetToken,
        clearResetToken,
    };