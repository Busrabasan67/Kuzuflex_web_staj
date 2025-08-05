import { Router } from "express";
import { getAllGroups, getProductsByGroupId, getProductsByGroupSlug, getAdminProductGroups, createProductGroupWithFormData, updateProductGroup, deleteProductGroup, updateProductGroupImage } from "../controllers/productGroupController";

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
 * /api/product-groups/slug/{groupSlug}/products:
 *   get:
 *     summary: Slug ile ürün grubuna ait alt ürünleri getirir (YENİ)
 *     parameters:
 *       - in: path
 *         name: groupSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Ürün grup slug'ı (örn: metal-hoses)
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
router.get("/slug/:groupSlug/products", getProductsByGroupSlug);

/**
 * @swagger
 * /api/product-groups/{groupId}/products:
 *   get:
 *     summary: ID ile ürün grubuna ait alt ürünleri getirir (ESKİ - backward compatibility)
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
 *     tags: [Product Groups]
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
 *     tags: [Product Groups]
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
router.post("/formdata", createProductGroupWithFormData);

/**
 * @swagger
 * /api/product-groups/{id}:
 *   put:
 *     summary: Bir üst ürün kategorisini (ProductGroup) günceller
 *     tags: [Product Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek grup ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *               standard:
 *                 type: string
 *               translations:
 *                 type: string
 *                 description: JSON formatında 4 dilde çeviri bilgileri
 *     responses:
 *       200:
 *         description: Grup başarıyla güncellendi
 *       404:
 *         description: Grup bulunamadı
 *       400:
 *         description: Eksik veya hatalı veri
 *       500:
 *         description: Sunucu hatası
 */
router.put("/:id", updateProductGroup);

/**
 * @swagger
 * /api/product-groups/{id}:
 *   delete:
 *     summary: Bir üst ürün kategorisini (ProductGroup) siler
 *     tags: [Product Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek grup ID'si
 *     responses:
 *       200:
 *         description: Grup başarıyla silindi
 *       404:
 *         description: Grup bulunamadı
 *       400:
 *         description: Grup silinemez (bağlı ürünler var)
 *       500:
 *         description: Sunucu hatası
 */
router.delete("/:id", deleteProductGroup);

/**
 * @swagger
 * /api/product-groups/{id}/image:
 *   put:
 *     summary: Update product group image URL
 *     tags: [Product Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: New image URL
 *     responses:
 *       200:
 *         description: Product group image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       404:
 *         description: Product group not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/image", updateProductGroupImage);

export default router;
