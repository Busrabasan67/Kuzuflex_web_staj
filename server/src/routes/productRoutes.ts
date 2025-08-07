import express from "express";
import multer from "multer";
import path from "path";

import { getSubProduct, getProductBySlug, getAllProducts, createProduct, updateProduct, getProductById, deleteProduct } from "../controllers/productController";

// Product için storage
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/images/Products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProduct = multer({
  storage: productStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir!'));
    }
  }
});

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Alt ürün detayını getir
 *     tags: [Products]
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

// Slug bazlı ürün getirme (YENİ)
/**
 * @swagger
 * /api/products/slug/{groupSlug}/{productSlug}:
 *   get:
 *     summary: Slug ile alt ürün detayını getir (YENİ)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: groupSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Ürün grubu slug'ı (örn: metal-hoses)
 *       - in: path
 *         name: productSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Ürün slug'ı (örn: stainless-steel-hoses)
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
router.get("/slug/:groupSlug/:productSlug", getProductBySlug);

// Alt ürün verisi getiren route (ESKİ - backward compatibility)
router.get("/", getSubProduct);

/**
 * @swagger
 * /api/products/all:
 *   get:
 *     summary: Tüm ürünleri listele (admin paneli için)
 *     tags: [Products]
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
 *     tags: [Products]
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

// Alt ürün ekleme route'u (resim dahil)
router.post("/", uploadProduct.single("image"), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Tek alt ürün getir (düzenleme için)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün ID'si
 *     responses:
 *       200:
 *         description: Ürün başarıyla getirildi
 *       404:
 *         description: Ürün bulunamadı
 */

// Tek ürün getirme route'u
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Alt ürün güncelle
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek ürün ID'si
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
 *       200:
 *         description: Alt ürün başarıyla güncellendi
 *       404:
 *         description: Ürün bulunamadı
 *       400:
 *         description: Eksik veya hatalı veri
 *       500:
 *         description: Sunucu hatası
 */

// Alt ürün güncelleme route'u (resim dahil)
router.put("/:id", uploadProduct.single("image"), updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Alt ürün sil
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek ürün ID'si
 *     responses:
 *       200:
 *         description: Alt ürün başarıyla silindi
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

// Alt ürün silme route'u
router.delete("/:id", deleteProduct);



export default router;
