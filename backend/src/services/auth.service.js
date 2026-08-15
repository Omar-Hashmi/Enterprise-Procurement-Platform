const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/auth.repository");
const auditLogService = require("../services/audit-log.service");

const register = async (userData) => {
    if (!userData || !userData.password) {
        const error = new Error("Password is required");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    userData.password = hashedPassword;

    const message = await authRepository.register(userData);

    return message;
};

const login = async (userData, ip) => {
    if (!userData || !userData.email || !userData.password) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    const user = await authRepository.login(userData);

    if (!user) {
        await auditLogService.log({
            action: "login_failure",
            entity: "User",
            entityId: null,
            performedBy: null,
            performedByRole: null,
            ipAddress: ip,
            details: { email: userData.email }
        });
        const error = new Error("User not found");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordMatched = await bcrypt.compare(
        userData.password,
        user.password
    );

    if (!isPasswordMatched) {
        await auditLogService.log({
            action: "login_failure",
            entity: "User",
            entityId: user._id,
            performedBy: user._id,
            performedByRole: user.role,
            ipAddress: ip,
            details: {}
        });
        const error = new Error("Invalid password");
        error.statusCode = 401;
        throw error;
    }

    // Check if user account is active
    if (!user.isActive) {
        const error = new Error("Your account is inactive. Please contact the administrator.");
        error.statusCode = 403;
        throw error;
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

    await auditLogService.log({
        action: "login_success",
        entity: "User",
        entityId: user._id,
        performedBy: user._id,
        performedByRole: user.role,
        ipAddress: ip,
        details: {}
    });

    return {
        message: "Login Successful",
        token,
    };
};

const crypto = require('crypto');

// Change password for authenticated user
const changePassword = async (userId, currentPassword, newPassword) => {
    // Get user with password hash
    const user = await userRepository.getUserByIdWithPassword(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
        const err = new Error('Current password is incorrect');
        err.statusCode = 401;
        throw err;
    }
    if (!newPassword || newPassword.trim().length < 6) {
        const err = new Error('Invalid new password');
        err.statusCode = 400;
        throw err;
    }
    // Optional: prevent same password
    const same = await bcrypt.compare(newPassword, user.password);
    if (same) {
        const err = new Error('New password must be different');
        err.statusCode = 400;
        throw err;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await userRepository.updateUser(userId, { password: hashed });
    // Log password change
    await auditLogService.log({
      action: "password_changed",
      entity: "User",
      entityId: user._id,
      performedBy: user._id,
      performedByRole: user.role,
      ipAddress: null,
      details: {}
    });
    return { message: 'Password changed successfully' };
};

// Request password reset - generates token and stores it
const resetPasswordRequest = async (email) => {
    const user = await authRepository.login({ email }); // returns user with password
    if (!user) {
        // Do not reveal existence of email
        return { message: 'If the email exists, a reset link has been sent' };
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour
    await userRepository.setResetToken(user._id, token, expires);
    // Log password reset request (do not store token)
    await auditLogService.log({
        action: 'password_reset_requested',
        entity: 'User',
        entityId: user._id,
        performedBy: user._id,
        performedByRole: user.role,
        ipAddress: null,
        details: { email },
    });
    // TODO: send email with token. For now just return token for testing.
    return { message: 'Password reset token generated', resetToken: token };
};

// Reset password using token
const resetPassword = async (token, newPassword) => {
    if (!newPassword || newPassword.trim().length < 6) {
        const err = new Error('Invalid new password');
        err.statusCode = 400;
        throw err;
    }
    const user = await userRepository.findByResetToken(token);
    if (!user) {
        const err = new Error('Invalid or expired reset token');
        err.statusCode = 400;
        throw err;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await userRepository.updateUser(user._id, { password: hashed });
    await userRepository.clearResetToken(user._id);
    // Log password reset success
    await auditLogService.log({
        action: 'password_reset_success',
        entity: 'User',
        entityId: user._id,
        performedBy: user._id,
        performedByRole: user.role,
        ipAddress: null,
        details: {},
    });
    return { message: 'Password has been reset successfully' };
};

module.exports = {
    register,
    login,
    changePassword,
    resetPasswordRequest,
    resetPassword,
};