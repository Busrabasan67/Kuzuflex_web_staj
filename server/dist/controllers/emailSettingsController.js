"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailConnection = exports.updateEmailSettings = exports.getEmailSettings = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const EmailSettings_1 = require("../entity/EmailSettings");
const emailSettingsRepository = data_source_1.default.getRepository(EmailSettings_1.EmailSettings);
const getEmailSettings = async (req, res) => {
    try {
        const settings = await emailSettingsRepository.findOne({ where: { id: 1 } });
        if (!settings) {
            // Varsayılan ayarları oluştur
            const defaultSettings = emailSettingsRepository.create({
                smtpHost: 'smtp.office365.com',
                smtpPort: 587,
                encryption: 'TLS',
                authentication: true,
                smtpUsername: 'wifi@kuzuflex.com',
                contactFormRecipient: 'bilgiislem@kuzuflex.com'
            });
            const savedSettings = await emailSettingsRepository.save(defaultSettings);
            return res.json({ success: true, data: savedSettings });
        }
        res.json({ success: true, data: settings });
    }
    catch (error) {
        console.error('Email settings getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Email ayarları alınamadı' });
    }
};
exports.getEmailSettings = getEmailSettings;
const updateEmailSettings = async (req, res) => {
    try {
        const { smtpHost, smtpPort, encryption, authentication, smtpUsername, smtpPassword, contactFormRecipient, germanyEmail, mailFrom } = req.body;
        let settings = await emailSettingsRepository.findOne({ where: { id: 1 } });
        if (!settings) {
            settings = emailSettingsRepository.create({
                smtpHost,
                smtpPort,
                encryption,
                authentication,
                smtpUsername,
                smtpPassword,
                contactFormRecipient
            });
        }
        else {
            // Sadece şifre değiştiyse güncelle
            if (smtpPassword !== undefined) {
                settings.smtpPassword = smtpPassword;
            }
            settings.smtpHost = smtpHost;
            settings.smtpPort = smtpPort;
            settings.encryption = encryption;
            settings.authentication = authentication;
            settings.smtpUsername = smtpUsername;
            settings.contactFormRecipient = contactFormRecipient;
        }
        const savedSettings = await emailSettingsRepository.save(settings);
        res.json({
            success: true,
            message: 'Email ayarları güncellendi',
            data: savedSettings
        });
    }
    catch (error) {
        console.error('Email settings güncelleme hatası:', error);
        res.status(500).json({ success: false, message: 'Email ayarları güncellenemedi' });
    }
};
exports.updateEmailSettings = updateEmailSettings;
const testEmailConnection = async (req, res) => {
    try {
        const settings = await emailSettingsRepository.findOne({ where: { id: 1 } });
        if (!settings) {
            return res.status(400).json({ success: false, message: 'Email ayarları bulunamadı' });
        }
        // Test email gönder
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort,
            secure: settings.encryption === 'SSL',
            auth: {
                user: settings.smtpUsername,
                pass: settings.smtpPassword
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        // Test email gönder
        const info = await transporter.sendMail({
            from: `"KUZUFLEX Test" <${settings.smtpUsername}>`,
            to: settings.contactFormRecipient,
            subject: 'Email Ayarları Test',
            text: 'Bu bir test emailidir. Email ayarlarınız başarıyla çalışıyor.',
            html: '<p>Bu bir test emailidir. Email ayarlarınız başarıyla çalışıyor.</p>'
        });
        res.json({
            success: true,
            message: 'Test email başarıyla gönderildi',
            messageId: info.messageId
        });
    }
    catch (error) {
        console.error('Test email hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Test email gönderilemedi: ' + error.message
        });
    }
};
exports.testEmailConnection = testEmailConnection;
