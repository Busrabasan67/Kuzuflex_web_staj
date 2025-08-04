import express from "express";
import { uploadImage, uploadQMDocumentsFile } from "../controllers/uploadController";

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
 *           enum: [product-group, solution, product]
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
 * /api/upload/qm-documents/{language}/{documentType}:
 *   post:
 *     summary: QM Documents için dosya yükler (resim veya PDF)
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tr, en]
 *         description: "Dosya dili (tr veya en)"
 *       - in: path
 *         name: documentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [images, pdfs]
 *         description: "Dosya tipi (images veya pdfs)"
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
 *                 filename:
 *                   type: string
 *                 size:
 *                   type: integer
 *                 language:
 *                   type: string
 *                 type:
 *                   type: string
 *       400:
 *         description: "Geçersiz istek ya da dosya"
 */
router.post("/qm-documents/:language/:documentType", uploadQMDocumentsFile);

export default router;