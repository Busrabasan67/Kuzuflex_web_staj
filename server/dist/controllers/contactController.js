"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMailConnection = exports.sendDirectEmail = exports.submitContactForm = void 0;
const mailService_1 = __importDefault(require("../services/mailService"));
const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message, language, languageName } = req.body;
        console.log('Gelen Form Verisi:', req.body);
        console.log('Dil Bilgisi:', { language, languageName });
        // Validation
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        // Send email
        const emailSent = await mailService_1.default.sendContactFormEmail({
            name,
            email,
            phone,
            message,
            language,
            languageName
        });
        if (emailSent) {
            res.status(200).json({
                success: true,
                message: 'Your message has been successfully sent. We will get back to you as soon as possible.'
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'An error occurred while sending the message. Please try again later.'
            });
        }
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred. Please try again later.'
        });
    }
};
exports.submitContactForm = submitContactForm;
const sendDirectEmail = async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        // Validation
        if (!to || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        // Send email
        const emailSent = await mailService_1.default.sendDirectEmail(to, subject, message);
        if (emailSent) {
            res.status(200).json({
                success: true,
                message: 'Email sent successfully'
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'An error occurred while sending the email'
            });
        }
    }
    catch (error) {
        console.error('Direct email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
};
exports.sendDirectEmail = sendDirectEmail;
const testMailConnection = async (req, res) => {
    try {
        const isConnected = await mailService_1.default.verifyConnection();
        if (isConnected) {
            res.status(200).json({
                success: true,
                message: 'Mail service connection successful'
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Mail service connection failed'
            });
        }
    }
    catch (error) {
        console.error('Mail connection test error:', error);
        res.status(500).json({
            success: false,
            message: 'Mail service test failed'
        });
    }
};
exports.testMailConnection = testMailConnection;
