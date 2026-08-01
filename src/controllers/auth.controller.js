const authService = require("../services/auth.service");

const register = async (req, res) => {
    const message = await authService.register(req.body);

    res.send(message);
};

const login = async (req, res) => {
    const message = await authService.login(req.body);

    res.send(message);
};

module.exports = {
    register,
    login,
};