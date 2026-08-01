const authRepository = require("../repositories/auth.repository");

const register = async (userData) => {

    console.log(userData);

    const message = await authRepository.register(userData);

    return message;
};

module.exports = {
    register,
};