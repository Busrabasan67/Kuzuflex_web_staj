"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileSecurity = exports.getAdminStats = exports.updateAdminProfile = exports.getAdminProfile = exports.validateResetToken = exports.resetPassword = exports.forgotPassword = exports.validateToken = exports.changePassword = exports.login = void 0;
const authService_1 = __importDefault(require("../services/authService"));
const profileService_1 = __importDefault(require("../services/profileService"));
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const result = await authService_1.default.login(identifier, password);
        if (!result.success) {
            return res.status(401).json({ message: result.message });
        }
        return res.json({
            message: result.message,
            token: result.token,
            admin: result.admin
        });
    }
    catch (error) {
        console.error("Login controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.login = login;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({ message: "Yetkilendirme hatası" });
        }
        const result = await authService_1.default.changePassword(adminId, currentPassword, newPassword);
        if (!result.success) {
            const statusCode = result.message.includes("bulunamadı") ? 404 : 400;
            return res.status(statusCode).json({ message: result.message });
        }
        return res.json({ message: result.message });
    }
    catch (error) {
        console.error("Change password controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.changePassword = changePassword;
const validateToken = async (req, res) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({ message: "Geçersiz token" });
        }
        const result = await authService_1.default.validateToken(adminId);
        if (!result.success) {
            return res.status(401).json({ message: result.message });
        }
        return res.json({
            message: result.message,
            admin: result.admin
        });
    }
    catch (error) {
        console.error("Validate token controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.validateToken = validateToken;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService_1.default.forgotPassword(email);
        if (!result.success) {
            const statusCode = result.message.includes("gereklidir") ? 400 : 500;
            return res.status(statusCode).json({ message: result.message });
        }
        return res.json({ message: result.message });
    }
    catch (error) {
        console.error("Forgot password controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await authService_1.default.resetPassword(token, newPassword);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.json({ message: result.message });
    }
    catch (error) {
        console.error("Reset password controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.resetPassword = resetPassword;
const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        const result = await authService_1.default.validateResetToken(token);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.json({
            message: result.message,
            email: result.data?.email
        });
    }
    catch (error) {
        console.error("Validate reset token controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.validateResetToken = validateResetToken;
const getAdminProfile = async (req, res) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({ message: "Yetkilendirme hatası" });
        }
        const result = await profileService_1.default.getAdminProfile(adminId);
        if (!result.success) {
            const statusCode = result.message.includes("bulunamadı") ? 404 : 500;
            return res.status(statusCode).json({ message: result.message });
        }
        return res.json({
            message: result.message,
            admin: result.data
        });
    }
    catch (error) {
        console.error("Get admin profile controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.getAdminProfile = getAdminProfile;
const updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.user?.id;
        const { username, email } = req.body;
        if (!adminId) {
            return res.status(401).json({ message: "Yetkilendirme hatası" });
        }
        const result = await profileService_1.default.updateAdminProfile(adminId, username, email);
        if (!result.success) {
            const statusCode = result.message.includes("bulunamadı") ? 404 : 400;
            return res.status(statusCode).json({ message: result.message });
        }
        return res.json({
            message: result.message,
            admin: result.data
        });
    }
    catch (error) {
        console.error("Update admin profile controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.updateAdminProfile = updateAdminProfile;
const getAdminStats = async (req, res) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({ message: "Yetkilendirme hatası" });
        }
        const result = await profileService_1.default.getAdminStats(adminId);
        if (!result.success) {
            const statusCode = result.message.includes("bulunamadı") ? 404 : 500;
            return res.status(statusCode).json({ message: result.message });
        }
        return res.json({
            message: result.message,
            stats: result.data
        });
    }
    catch (error) {
        console.error("Get admin stats controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.getAdminStats = getAdminStats;
const getProfileSecurity = async (req, res) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({ message: "Yetkilendirme hatası" });
        }
        const result = await profileService_1.default.checkProfileSecurity(adminId);
        if (!result.success) {
            const statusCode = result.message.includes("bulunamadı") ? 404 : 500;
            return res.status(statusCode).json({ message: result.message });
        }
        return res.json({
            message: result.message,
            security: result.data
        });
    }
    catch (error) {
        console.error("Get profile security controller hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
};
exports.getProfileSecurity = getProfileSecurity;
