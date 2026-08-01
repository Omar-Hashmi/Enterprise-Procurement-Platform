const User = require("../models/user.model");

const register = async (userData) => {
    console.log(userData);

    const existingUser = await User.findOne({
        email: userData.email,
    });

    if (existingUser) {
        return "Email already exists";
    }

    const user = await User.create(userData);
    user.password = undefined;

    return user;
};

module.exports = {
    register,
};