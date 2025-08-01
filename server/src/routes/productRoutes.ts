import express from "express";

import { getSubProduct, getAllProducts } from "../controllers/productController";

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

export default router;
