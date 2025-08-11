import express from "express";
import { uploadQMDocumentsFile, uploadPage } from "../controllers/uploadController";

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

// About/Page hero upload
router.post("/page-hero", uploadPage.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi' });
  const url = `/uploads/images/Pages/${req.file.filename}`;
  return res.status(200).json({ url });
});


export default router;