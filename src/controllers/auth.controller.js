const authService = require("../services/auth.service");

const register = async (req, res) => {

    console.log(req.body);

    const message = await authService.register(req.body);

    res.send(message);
};

module.exports = {
    register,
};