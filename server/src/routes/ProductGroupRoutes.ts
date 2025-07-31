import { Router } from "express";
import { getAllGroups, getProductsByGroupId, getAdminProductGroups, createProductGroupWithFormData } from "../controllers/productGroupController";
import { upload } from "../controllers/uploadController";

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
 * /api/product-groups:
 *   post:
 *     summary: Yeni bir üst ürün kategorisi (ProductGroup) ve 4 dilde çevirisini ekler
 *     tags: [ProductGroup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: Grup görselinin yolu
 *                 example: "group-image.jpg"
 *               standard:
 *                 type: string
 *                 description: Grup standardı
 *                 example: "ISO 9001"
 *               translations:
 *                 type: array
 *                 description: 4 dilde çeviri bilgileri
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                       description: Dil kodu (tr, en, fr, de)
 *                       example: "tr"
 *                     title:
 *                       type: string
 *                       description: Grup adı
 *                       example: "Türkçe Grup"
 *                     description:
 *                       type: string
 *                       description: Grup açıklaması
 *                       example: "Türkçe Açıklama"
 *     responses:
 *       201:
 *         description: Grup başarıyla eklendi
 *       400:
 *         description: Eksik veya hatalı veri
 *       500:
 *         description: Sunucu hatası
 */
// FormData ile hem dosya hem diğer alanları alan endpoint
router.post("/formdata", upload.single("image"), createProductGroupWithFormData);

export default router;
