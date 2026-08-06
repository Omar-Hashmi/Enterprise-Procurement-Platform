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

module.exports = {
    register,
    login,
    profile,
};