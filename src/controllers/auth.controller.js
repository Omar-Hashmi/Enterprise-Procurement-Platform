const authService = require("../services/auth.service");

const register = async (req, res) => {
    console.log(req.body);

    const message = await authService.register(req.body);

    res.send(message);
};

const login = async (req, res) => {
    const message = await authService.login(req.body);

    res.send(message);
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