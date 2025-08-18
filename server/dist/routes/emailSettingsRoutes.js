"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emailSettingsController_1 = require("../controllers/emailSettingsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Tüm email settings route'ları admin authentication gerektirir
router.use(authMiddleware_1.authenticateToken);
// Email ayarlarını getir
router.get('/', emailSettingsController_1.getEmailSettings);
// Email ayarlarını güncelle
router.put('/', emailSettingsController_1.updateEmailSettings);
// Email bağlantısını test et
router.post('/test-connection', emailSettingsController_1.testEmailConnection);
exports.default = router;
/**
 * @swagger
 * /api/email-settings:
 *   get:
 *     summary: Email ayarlarını getir
 *     tags: [Email Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email ayarları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     smtpHost:
 *                       type: string
 *                       example: "smtp.office365.com"
 *                       description: SMTP sunucu adresi
 *                     smtpPort:
 *                       type: number
 *                       example: 587
 *                       description: SMTP port numarası
 *                     encryption:
 *                       type: string
 *                       enum: [TLS, SSL, None]
 *                       example: "TLS"
 *                       description: Şifreleme türü
 *                     authentication:
 *                       type: boolean
 *                       example: true
 *                       description: Kimlik doğrulama gerekli mi
 *                     smtpUsername:
 *                       type: string
 *                       example: "wifi@kuzuflex.com"
 *                       description: SMTP kullanıcı adı
 *                     contactFormRecipient:
 *                       type: string
 *                       example: "bilgiislem@kuzuflex.com"
 *                       description: İletişim formu alıcısı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
/**
 * @swagger
 * /api/email-settings:
 *   put:
 *     summary: Email ayarlarını güncelle
 *     tags: [Email Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - smtpHost
 *               - smtpPort
 *               - encryption
 *               - authentication
 *               - smtpUsername
 *               - contactFormRecipient
 *             properties:
 *               smtpHost:
 *                 type: string
 *                 example: "smtp.office365.com"
 *                 description: SMTP sunucu adresi
 *               smtpPort:
 *                 type: number
 *                 example: 587
 *                 description: SMTP port numarası
 *               encryption:
 *                 type: string
 *                 enum: [TLS, SSL, None]
 *                 example: "TLS"
 *                 description: Şifreleme türü
 *               authentication:
 *                 type: boolean
 *                 example: true
 *                 description: Kimlik doğrulama gerekli mi
 *               smtpUsername:
 *                 type: string
 *                 example: "wifi@kuzuflex.com"
 *                 description: SMTP kullanıcı adı
 *               smtpPassword:
 *                 type: string
 *                 example: "password123"
 *                 description: SMTP şifresi (opsiyonel, güncellenmezse mevcut kullanılır)
 *               contactFormRecipient:
 *                 type: string
 *                 example: "bilgiislem@kuzuflex.com"
 *                 description: İletişim formu alıcısı
 *     responses:
 *       200:
 *         description: Email ayarları başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email ayarları başarıyla güncellendi"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     smtpHost:
 *                       type: string
 *                       example: "smtp.office365.com"
 *       400:
 *         description: Geçersiz veri formatı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
/**
 * @swagger
 * /api/email-settings/test-connection:
 *   post:
 *     summary: Email bağlantısını test et
 *     tags: [Email Settings]
 *     security:
 *       - bearerAuth: []
 *     description: Mevcut email ayarları ile test email'i gönder
 *     responses:
 *       200:
 *         description: Test email başarıyla gönderildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Test email başarıyla gönderildi"
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Email gönderim hatası
 */
