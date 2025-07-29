import express from "express";
import { uploadImage, deleteImage } from "../controllers/uploadController";

const router = express.Router();

/**
 * @openapi
 * /api/upload/image:
 *   post:
 *     summary: Resim yükler
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
 */
router.post("/image", uploadImage);

/**
 * @openapi
 * /api/upload/image/{filename}:
 *   delete:
 *     summary: Resmi siler
 *     parameters:
 *       - name: filename
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Resim başarıyla silindi"
 */
router.delete("/image/:filename", deleteImage);

export default router;