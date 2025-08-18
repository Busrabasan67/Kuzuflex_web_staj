import { Router } from "express";
import { login, changePassword, validateToken, forgotPassword, resetPassword, validateResetToken, getAdminProfile, updateAdminProfile, getAdminStats, getProfileSecurity } from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/admin-login", login); // ← /api/auth/admin-login olacak
router.post("/change-password", authenticateToken, changePassword); // ← /api/auth/change-password olacak
router.get("/validate-token", authenticateToken, validateToken); // ← /api/auth/validate-token olacak
router.post("/forgot-password", forgotPassword); // ← /api/auth/forgot-password olacak
router.post("/reset-password", resetPassword); // ← /api/auth/reset-password olacak
router.get("/validate-reset-token/:token", validateResetToken); // ← /api/auth/validate-reset-token/:token olacak
router.get("/profile", authenticateToken, getAdminProfile); // ← /api/auth/profile olacak
router.put("/profile", authenticateToken, updateAdminProfile); // ← /api/auth/profile olacak
router.get("/profile/stats", authenticateToken, getAdminStats); // ← /api/auth/profile/stats olacak
router.get("/profile/security", authenticateToken, getProfileSecurity); // ← /api/auth/profile/security olacak

export default router;

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Şifre sıfırlama isteği gönder
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *                 description: Admin email adresi
 *     responses:
 *       200:
 *         description: Şifre sıfırlama email'i gönderildi
 *       400:
 *         description: Geçersiz email formatı
 *       404:
 *         description: Email adresi bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Şifre sıfırlama işlemi
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "reset_token_12345"
 *                 description: Şifre sıfırlama token'ı
 *               newPassword:
 *                 type: string
 *                 example: "yeni123"
 *                 description: Yeni şifre (en az 6 karakter)
 *     responses:
 *       200:
 *         description: Şifre başarıyla sıfırlandı
 *       400:
 *         description: Geçersiz token veya şifre
 *       401:
 *         description: Token süresi dolmuş
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/auth/validate-reset-token/{token}:
 *   get:
 *     summary: Şifre sıfırlama token'ının geçerliliğini kontrol et
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Şifre sıfırlama token'ı
 *         example: "reset_token_12345"
 *     responses:
 *       200:
 *         description: Token geçerli
 *       400:
 *         description: Geçersiz token formatı
 *       401:
 *         description: Token süresi dolmuş
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Admin profil bilgilerini getir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "admin"
 *                 email:
 *                   type: string
 *                   example: "admin@example.com"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-17T14:30:00Z"
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Admin profil bilgilerini güncelle
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "new_admin"
 *                 description: Yeni kullanıcı adı
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newadmin@example.com"
 *                 description: Yeni email adresi
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *       400:
 *         description: Geçersiz veri formatı
 *       401:
 *         description: Yetkilendirme hatası
 *       409:
 *         description: Email veya kullanıcı adı zaten kullanımda
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/auth/profile/stats:
 *   get:
 *     summary: Admin profil istatistiklerini getir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil istatistikleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-17T14:30:00Z"
 *                 loginCount:
 *                   type: number
 *                   example: 42
 *                 passwordChangedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-15T10:00:00Z"
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/auth/profile/security:
 *   get:
 *     summary: Admin profil güvenlik bilgilerini getir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil güvenlik bilgileri başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
/**
 * @swagger
 * /api/auth/admin-login:
 *   post:
 *     summary: Admin girişi yap
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *       401:
 *         description: Hatalı şifre veya kullanıcı bulunamadı
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Admin şifresini değiştir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "123456"
 *                 description: Mevcut şifre
 *               newPassword:
 *                 type: string
 *                 example: "yeni123"
 *                 description: Yeni şifre (en az 6 karakter)
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *       400:
 *         description: Hatalı mevcut şifre veya geçersiz yeni şifre
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/auth/validate-token:
 *   get:
 *     summary: JWT token'ın geçerliliğini kontrol et
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token geçerli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token geçerli"
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "admin"
 *                     email:
 *                       type: string
 *                       example: "admin@example.com"
 *       401:
 *         description: Geçersiz token
 *       500:
 *         description: Sunucu hatası
 */