const authRepository = require("../repositories/auth.repository");

const register = () => {
    const message = authRepository.register();

    return message;
};

module.exports = {
    register,
};