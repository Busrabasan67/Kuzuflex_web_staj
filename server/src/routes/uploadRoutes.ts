import express from "express";
import { uploadImage, uploadQMDocumentsFile, uploadMarketImage } from "../controllers/uploadController";

const router = express.Router();

/**
 * @openapi
 * /api/upload/image/{type}/{id}:
 *   post:
 *     summary: Belirli bir tür ve ID için resim yükler
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [product-group, solution, product, market]
 *         description: "Yükleme tipi (örn: product-group, solution)"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "İlgili varlığın veritabanı ID'si"
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
 *     responses:
 *       200:
 *         description: "Resim başarıyla yüklendi"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "/uploads/images/Products/product-group-169999999.png"
 *                 filename:
 *                   type: string
 *                 size:
 *                   type: integer
 *       400:
 *         description: "Geçersiz istek ya da dosya"
 */

router.post("/image/:type/:id", uploadImage);

/**
 * @openapi
 * /api/upload/market-image:
 *   post:
 *     summary: Market için resim yükler
 *     tags: [Upload]
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
 *     responses:
 *       200:
 *         description: "Market resmi başarıyla yüklendi"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "/uploads/images/Markets/market-169999999.webp"
 *                 filename:
 *                   type: string
 *                 size:
 *                   type: integer
 *       400:
 *         description: "Geçersiz istek ya da dosya"
 */
router.post("/market-image", uploadMarketImage);

/**
 * @openapi
 * /api/upload/qm-documents:
 *   post:
 *     summary: QM Documents için dosya yükler (resim veya PDF)
 *     tags: [Upload]
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
 *               documentType:
 *                 type: string
 *                 enum: [certificate, document]
 *               language:
 *                 type: string
 *                 enum: [tr, en]
 *               fileType:
 *                 type: string
 *                 enum: [image, pdf]
 *     responses:
 *       200:
 *         description: "Dosya başarıyla yüklendi"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "/uploads/qm-documents-and-certificates/images/tr/qm-doc-169999999.jpg"
 *                 fullPath:
 *                   type: string
 *                 size:
 *                   type: integer
 *                 language:
 *                   type: string
 *                 documentType:
 *                   type: string
 *       400:
 *         description: "Geçersiz istek ya da dosya"
 */
router.post("/qm-documents", uploadQMDocumentsFile);

export default router;