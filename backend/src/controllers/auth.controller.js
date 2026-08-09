const authService = require("../services/auth.service");

const register = async (req, res) => {
    try {
        console.log("Register Body:", req.body);

        const message = await authService.register(req.body);

        return res.send(message);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        // Debugging
        console.log("Login Body:", req.body);

        const message = await authService.login(req.body);

        return res.send(message);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const profile = (req, res) => {
    res.json({
        message: "Protected Route Working",
        user: req.user,
    });
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId; // from auth middleware
        const { currentPassword, newPassword } = req.body;
        const result = await authService.changePassword(userId, currentPassword, newPassword);
        return res.json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// Password Reset Request
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.resetPasswordRequest(email);
        return res.json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// Reset Password using token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await authService.resetPassword(token, newPassword);
        return res.json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    profile,
    changePassword,
    requestPasswordReset,
    resetPassword,
};