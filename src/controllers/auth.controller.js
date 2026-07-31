const authService = require("../services/auth.service");

const register = (req, res) => {
    const message = authService.register();

    res.send(message);
};

module.exports = {
    register,
};