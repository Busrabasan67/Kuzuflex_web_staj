import { Router } from "express";
import { getAllGroups, getProductsByGroupId, getAdminProductGroups, createProductGroupWithFormData } from "../controllers/productGroupController";
import { uploadProductGroup } from "../controllers/uploadController";

const router = Router();

/**
 * @swagger
 * /api/product-groups:
 *   get:
 *     summary: Tüm ürün gruplarını ve alt ürünleri getirir
 *     parameters:
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *         description: Çeviri dili
 *     responses:
 *       200:
 *         description: Gruplar başarıyla getirildi
 */
router.get("/", getAllGroups);

/**
 * @swagger
 * /api/product-groups/{groupId}/products:
 *   get:
 *     summary: Belirli bir ürün grubuna ait alt ürünleri getirir
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün grup ID
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *         description: Çeviri dili (varsayılan: tr)
 *     responses:
 *       200:
 *         description: Alt ürünler başarıyla listelendi
 */
router.get("/:groupId/products", getProductsByGroupId);

/**
 * @swagger
 * /api/product-groups/admin:
 *   get:
 *     summary: Admin paneli için tüm ürün gruplarını getirir
 *     tags: [ProductGroup]
 *     responses:
 *       200:
 *         description: Gruplar başarıyla getirildi
 */
router.get("/admin", getAdminProductGroups);

/**
 * @swagger
 * /api/product-groups/formdata:
 *   post:
 *     summary: Yeni bir üst ürün kategorisi (ProductGroup) ve 4 dilde çevirisini ekler (FormData ile)
 *     tags: [ProductGroup]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Grup görseli
 *               standard:
 *                 type: string
 *               translations:
 *                 type: string
 *                 description: JSON formatında 4 dilde çeviri bilgileri
 *                 example: '[{"language":"tr","title":"Grup","description":"Açıklama"}, ...]'
 *     responses:
 *       201:
 *         description: Grup başarıyla eklendi
 *       400:
 *         description: Eksik veya hatalı veri
 *       500:
 *         description: Sunucu hatası
 */
router.post("/formdata", uploadProductGroup.single("image"), createProductGroupWithFormData);

export default router;
