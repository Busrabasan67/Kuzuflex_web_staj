import express from "express";
import { uploadImage } from "../controllers/uploadController";

const router = express.Router();

/**
 * @openapi
 * /api/upload/image/{type}/{id}:
 *   post:
 *     summary: Belirli bir tür ve ID için resim yükler
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [product-group, solution]
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


export default router;