import express from 'express';
import { submitContactForm, sendDirectEmail, testMailConnection } from '../controllers/contactController';

const router = express.Router();

// Contact form submission
router.post('/submit', submitContactForm);

// Direct email sending
router.post('/send-direct', sendDirectEmail);

// Test mail connection (for debugging)
router.get('/test-connection', testMailConnection);

export default router;

/**
 * @swagger
 * /api/contact/submit:
 *   post:
 *     summary: İletişim formu gönder
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ahmet Yılmaz"
 *                 description: İletişim kuran kişinin adı
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmet@example.com"
 *                 description: İletişim email adresi
 *               subject:
 *                 type: string
 *                 example: "Ürün Bilgisi"
 *                 description: İletişim konusu
 *               message:
 *                 type: string
 *                 example: "Merhaba, ürünleriniz hakkında bilgi almak istiyorum."
 *                 description: İletişim mesajı
 *               phone:
 *                 type: string
 *                 example: "+90 555 123 45 67"
 *                 description: Telefon numarası (opsiyonel)
 *               company:
 *                 type: string
 *                 example: "ABC Şirketi"
 *                 description: Şirket adı (opsiyonel)
 *     responses:
 *       200:
 *         description: İletişim formu başarıyla gönderildi
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
 *                   example: "İletişim formu başarıyla gönderildi"
 *       400:
 *         description: Geçersiz form verisi
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/contact/send-direct:
 *   post:
 *     summary: Doğrudan email gönder
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 example: "alici@example.com"
 *                 description: Alıcı email adresi
 *               subject:
 *                 type: string
 *                 example: "Önemli Bilgi"
 *                 description: Email konusu
 *               message:
 *                 type: string
 *                 example: "Bu önemli bir mesajdır."
 *                 description: Email mesajı
 *               from:
 *                 type: string
 *                 format: email
 *                 example: "gonderici@example.com"
 *                 description: Gönderici email adresi (opsiyonel)
 *     responses:
 *       200:
 *         description: Email başarıyla gönderildi
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
 *                   example: "Email başarıyla gönderildi"
 *       400:
 *         description: Geçersiz email verisi
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/contact/test-connection:
 *   get:
 *     summary: Mail bağlantısını test et
 *     tags: [Contact]
 *     description: Mail sunucusu bağlantısını test etmek için kullanılır (debug amaçlı)
 *     responses:
 *       200:
 *         description: Mail bağlantısı başarılı
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
 *                   example: "Mail bağlantısı başarılı"
 *       500:
 *         description: Mail bağlantı hatası
 */
