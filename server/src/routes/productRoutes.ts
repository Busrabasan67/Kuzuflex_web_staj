import express from "express";

import { getSubProduct, getAllProducts, createProduct } from "../controllers/productController";

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Alt ürün detayını getir
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: group
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün grubu ID'si
 *       - in: query
 *         name: sub
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alt ürün ID'si
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *         description: Çeviri dili (varsayılan "tr")
 *     responses:
 *       200:
 *         description: Ürün detayları başarıyla getirildi
 */

// Alt ürün verisi getiren route
router.get("/", getSubProduct);

/**
 * @swagger
 * /api/products/all:
 *   get:
 *     summary: Tüm ürünleri listele (admin paneli için)
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *         description: Çeviri dili (varsayılan "tr")
 *     responses:
 *       200:
 *         description: Tüm ürünler başarıyla getirildi
 */

// Tüm ürünleri listeleyen route (admin paneli için)
router.get("/all", getAllProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni alt ürün ekle
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: Ürün resmi URL'i
 *               standard:
 *                 type: string
 *                 description: Ürün standardı (opsiyonel)
 *               groupId:
 *                 type: integer
 *                 description: Üst kategori ID'si
 *               translations:
 *                 type: string
 *                 description: JSON formatında 4 dilde çeviri bilgileri
 *     responses:
 *       201:
 *         description: Alt ürün başarıyla eklendi
 *       400:
 *         description: Eksik veya hatalı veri
 *       500:
 *         description: Sunucu hatası
 */

// Alt ürün ekleme route'u
router.post("/", createProduct);

export default router;
