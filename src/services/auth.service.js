const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/auth.repository");

const register = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    userData.password = hashedPassword;

    const message = await authRepository.register(userData);

    return message;
};

const login = async (userData) => {
    const user = await authRepository.login(userData);

    if (!user) {
        return "User not found";
    }

    const isPasswordMatched = await bcrypt.compare(
        userData.password,
        user.password
    );

    if (!isPasswordMatched) {
        return "Invalid password";
    }

    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    return {
        message: "Login Successful",
        token,
    };
};

module.exports = {
    register,
    login,
};