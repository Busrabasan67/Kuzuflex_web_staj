import express from 'express';
import {
  createMultiLanguageExtraContent,
  createExtraContent,
  getExtraContent,
  getAllExtraContents,
  updateExtraContent,
  updateGroupExtraContent,
  deleteExtraContent,
  getExtraContentsByLanguage
} from '../controllers/aboutPageExtraContentController';

const router = express.Router();

// Çoklu dil için ekstra içerik ekle
router.post('/multi', createMultiLanguageExtraContent);

// Tek ekstra içerik ekle
router.post('/', createExtraContent);

// Ekstra içerik getir
router.get('/:id', getExtraContent);

// Tüm ekstra içerikleri getir
router.get('/', getAllExtraContents);

// Dil bazında ekstra içerikleri getir
router.get('/language/:language', getExtraContentsByLanguage);

// Grup güncelleme - önce tanımlanmalı
router.put('/update-group', updateGroupExtraContent);

// Ekstra içerik güncelle
router.put('/:id', updateExtraContent);

// Ekstra içerik sil
router.delete('/:id', deleteExtraContent);

export default router;

/**
 * @swagger
 * /api/about-page-extra-content/multi:
 *   post:
 *     summary: Çoklu dil için ekstra içerik ekle
 *     tags: [About Page Extra Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - order
 *               - pageId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [text, table, list, mixed]
 *                 example: "mixed"
 *                 description: İçerik türü
 *               order:
 *                 type: number
 *                 example: 1
 *                 description: İçerik sırası
 *               pageId:
 *                 type: number
 *                 example: 1
 *                 description: Hakkımızda sayfası ID'si
 *               contents:
 *                 type: object
 *                 description: Dil bazında içerikler
 *                 properties:
 *                   tr:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Türkçe Başlık"
 *                       content:
 *                         type: string
 *                         example: "Türkçe içerik"
 *                   en:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "English Title"
 *                       content:
 *                         type: string
 *                         example: "English content"
 *                   de:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Deutscher Titel"
 *                       content:
 *                         type: string
 *                         example: "Deutscher Inhalt"
 *                   fr:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Titre Français"
 *                       content:
 *                         type: string
 *                         example: "Contenu français"
 *     responses:
 *       200:
 *         description: Çoklu dil içerikleri başarıyla eklendi
 *       400:
 *         description: Geçersiz veri formatı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/about-page-extra-content:
 *   post:
 *     summary: Tek ekstra içerik ekle
 *     tags: [About Page Extra Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - content
 *               - order
 *               - language
 *               - pageId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [text, table, list, mixed]
 *                 example: "text"
 *                 description: İçerik türü
 *               title:
 *                 type: string
 *                 example: "Başlık"
 *                 description: İçerik başlığı
 *               content:
 *                 type: string
 *                 example: "İçerik metni"
 *                 description: İçerik
 *               order:
 *                 type: number
 *                 example: 1
 *                 description: İçerik sırası
 *               language:
 *                 type: string
 *                 enum: [tr, en, de, fr]
 *                 example: "tr"
 *                 description: Dil kodu
 *               pageId:
 *                 type: number
 *                 example: 1
 *                 description: Hakkımızda sayfası ID'si
 *     responses:
 *       200:
 *         description: İçerik başarıyla eklendi
 *       400:
 *         description: Geçersiz veri formatı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/about-page-extra-content/{id}:
 *   get:
 *     summary: Belirli bir ekstra içeriği getir
 *     tags: [About Page Extra Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: İçerik ID'si
 *         example: 1
 *     responses:
 *       200:
 *         description: İçerik başarıyla getirildi
 *       404:
 *         description: İçerik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/about-page-extra-content:
 *   get:
 *     summary: Tüm ekstra içerikleri getir
 *     tags: [About Page Extra Content]
 *     responses:
 *       200:
 *         description: Tüm içerikler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     example: 1
 *                   type:
 *                     type: string
 *                     example: "text"
 *                   title:
 *                     type: string
 *                     example: "Başlık"
 *                   content:
 *                     type: string
 *                     example: "İçerik"
 *                   order:
 *                     type: number
 *                     example: 1
 *                   language:
 *                     type: string
 *                     example: "tr"
 *                   pageId:
 *                     type: number
 *                     example: 1
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/about-page-extra-content/language/{language}:
 *   get:
 *     summary: Belirli bir dile ait ekstra içerikleri getir
 *     tags: [About Page Extra Content]
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tr, en, de, fr]
 *         description: Dil kodu
 *         example: "tr"
 *     responses:
 *       200:
 *         description: Dil bazında içerikler başarıyla getirildi
 *       400:
 *         description: Geçersiz dil kodu
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/about-page-extra-content/update-group:
 *   put:
 *     summary: Grup halinde ekstra içerikleri güncelle
 *     tags: [About Page Extra Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - type
 *               - order
 *               - pageId
 *               - contents
 *             properties:
 *               groupId:
 *                 type: number
 *                 example: 1
 *                 description: Grup ID'si
 *               type:
 *                 type: string
 *                 enum: [text, table, list, mixed]
 *                 example: "mixed"
 *                 description: İçerik türü
 *               order:
 *                 type: number
 *                 example: 1
 *                 description: İçerik sırası
 *               pageId:
 *                 type: number
 *                 example: 1
 *                 description: Hakkımızda sayfası ID'si
 *               contents:
 *                 type: object
 *                 description: Dil bazında içerikler
 *               existingIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1, 2, 3, 4]
 *                 description: Mevcut içerik ID'leri
 *     responses:
 *       200:
 *         description: Grup içerikleri başarıyla güncellendi
 *       400:
 *         description: Geçersiz veri formatı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/about-page-extra-content/{id}:
 *   put:
 *     summary: Belirli bir ekstra içeriği güncelle
 *     tags: [About Page Extra Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: İçerik ID'si
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [text, table, list, mixed]
 *                 example: "text"
 *               title:
 *                 type: string
 *                 example: "Güncellenmiş Başlık"
 *               content:
 *                 type: string
 *                 example: "Güncellenmiş içerik"
 *               order:
 *                 type: number
 *                 example: 1
 *               language:
 *                 type: string
 *                 enum: [tr, en, de, fr]
 *                 example: "tr"
 *               pageId:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: İçerik başarıyla güncellendi
 *       400:
 *         description: Geçersiz veri formatı
 *       404:
 *         description: İçerik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/about-page-extra-content/{id}:
 *   delete:
 *     summary: Belirli bir ekstra içeriği sil
 *     tags: [About Page Extra Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: İçerik ID'si
 *         example: 1
 *     responses:
 *       200:
 *         description: İçerik başarıyla silindi
 *       404:
 *         description: İçerik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
