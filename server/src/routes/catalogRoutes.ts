import { Router } from "express";
import {
  getCatalogsByProduct,
  addCatalogToProduct,
  deleteCatalog,
  updateCatalog,
} from "../controllers/catalogController";
import multer from "multer";
import path from "path";
import fs from "fs";

// PDF upload için storage ayarı
const BASE_UPLOAD_DIR = path.join(__dirname, "../../public/uploads/catalogs");
if (!fs.existsSync(BASE_UPLOAD_DIR)) fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, BASE_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `catalog-${uniqueSuffix}${ext}`);
  },
});
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error(`Sadece PDF dosyası yüklenebilir! Seçtiğiniz dosya: ${file.originalname} (${file.mimetype})`));
  }
};
const upload = multer({ storage, fileFilter });

const router = Router();

/**
 * @swagger
 * /api/catalogs/product/{productId}:
 *   get:
 *     summary: Bir alt ürünün kataloglarını getir
 *     tags: [Catalogs]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alt ürün ID'si
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *         description: Dil kodu (varsayılan: tr)
 *     responses:
 *       200:
 *         description: Kataloglar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   filePath:
 *                     type: string
 *                   name:
 *                     type: string
 *                   translations:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         language:
 *                           type: string
 *                         name:
 *                           type: string
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get("/product/:productId", getCatalogsByProduct);

/**
 * @swagger
 * /api/catalogs/product/{productId}:
 *   post:
 *     summary: Alt ürüne katalog ekle
 *     tags: [Catalogs]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alt ürün ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF dosyası
 *               translations:
 *                 type: string
 *                 description: JSON string - [{"language":"tr","name":"Katalog Adı"}]
 *     responses:
 *       201:
 *         description: Katalog başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: PDF dosyası gerekli
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post("/product/:productId", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, addCatalogToProduct);

/**
 * @swagger
 * /api/catalogs/{catalogId}:
 *   put:
 *     summary: Katalog güncelle
 *     tags: [Catalogs]
 *     parameters:
 *       - in: path
 *         name: catalogId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Katalog ID'si
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF dosyası (opsiyonel)
 *               translations:
 *                 type: string
 *                 description: JSON string - [{"language":"tr","name":"Yeni Ad"}]
 *     responses:
 *       200:
 *         description: Katalog başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Katalog bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put("/:catalogId", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, updateCatalog);

/**
 * @swagger
 * /api/catalogs/{catalogId}:
 *   delete:
 *     summary: Katalog sil
 *     tags: [Catalogs]
 *     parameters:
 *       - in: path
 *         name: catalogId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Katalog ID'si
 *     responses:
 *       200:
 *         description: Katalog başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Katalog bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete("/:catalogId", deleteCatalog);

export default router; 