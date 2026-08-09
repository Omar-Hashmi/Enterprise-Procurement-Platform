const userService = require("../services/user.service");

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        return res.status(200).json(users);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        return res.status(200).json(user);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedUser = await userService.updateUser(id, req.body);

        return res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const softDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.softDeleteUser(id);

        return res.status(200).json({
            message: "User deactivated successfully",
            user,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const activateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.activateUser(id);

        return res.status(200).json({
            message: "User activated successfully",
            user,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser,
    activateUser,
};