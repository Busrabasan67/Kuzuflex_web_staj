"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = __importDefault(require("../data-source"));
const ProductGroup_1 = require("../entity/ProductGroup");
const productGroupController_1 = require("../controllers/productGroupController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// ProductGroup için storage konfigürasyonu
const productGroupStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/images/Products/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const uploadProductGroup = (0, multer_1.default)({
    storage: productGroupStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Sadece resim dosyaları kabul edilir!'));
        }
    }
});
const router = (0, express_1.Router)();
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
router.get("/", productGroupController_1.getAllGroups);
// Ürün grubu sayısını getiren route (dashboard için)
router.get("/count", async (req, res) => {
    try {
        const groupRepository = data_source_1.default.getRepository(ProductGroup_1.ProductGroup);
        const count = await groupRepository.count();
        res.json(count);
    }
    catch (error) {
        console.error('Ürün grubu sayısı alınamadı:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
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
 *         description: "Ürün grup slug'ı (örn: metal-hoses)"
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
router.get("/slug/:groupSlug/products", productGroupController_1.getProductsByGroupSlug);
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
router.get("/:groupId/products", productGroupController_1.getProductsByGroupId);
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
router.get("/admin", productGroupController_1.getAdminProductGroups);
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
router.post("/formdata", uploadProductGroup.single("image"), productGroupController_1.createProductGroupWithFormData);
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Grup görseli (opsiyonel)
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
router.put("/:id", uploadProductGroup.single("image"), productGroupController_1.updateProductGroup);
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
router.delete("/:id", productGroupController_1.deleteProductGroup);
exports.default = router;
