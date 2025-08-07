import express from "express";
import { uploadQMDocumentsFile } from "../controllers/uploadController";

const router = express.Router();





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