const bcrypt = require("bcrypt");
const authRepository = require("../repositories/auth.repository");

const register = async (userData) => {
    console.log(userData);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    userData.password = hashedPassword;

    const message = await authRepository.register(userData);

    return message;
};

module.exports = {
    register,
};