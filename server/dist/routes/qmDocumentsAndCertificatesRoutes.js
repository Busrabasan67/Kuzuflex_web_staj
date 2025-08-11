"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const qmDocumentsAndCertificatesController_1 = require("../controllers/qmDocumentsAndCertificatesController");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/qm-documents-and-certificates:
 *   get:
 *     summary: Tüm QM Documents & Certificates'ları getir
 *     tags: [QM Documents & Certificates]
 *     parameters:
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *         description: Çeviri dili (varsayılan "tr")
 *     responses:
 *       200:
 *         description: QM Documents & Certificates başarıyla getirildi
 */
router.get("/", qmDocumentsAndCertificatesController_1.getAllQMDocumentsAndCertificates);
/**
 * @swagger
 * /api/qm-documents-and-certificates/{id}:
 *   get:
 *     summary: Belirli bir QM Document & Certificate'ı getir
 *     tags: [QM Documents & Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: QM Document & Certificate ID'si
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *         description: Çeviri dili (varsayılan "tr")
 *     responses:
 *       200:
 *         description: QM Document & Certificate başarıyla getirildi
 *       404:
 *         description: QM Document & Certificate bulunamadı
 */
router.get("/:id", qmDocumentsAndCertificatesController_1.getQMDocumentAndCertificateById);
/**
 * @swagger
 * /api/qm-documents-and-certificates:
 *   post:
 *     summary: Yeni QM Document & Certificate oluştur
 *     tags: [QM Documents & Certificates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Doküman başlığı
 *               description:
 *                 type: string
 *                 description: Doküman açıklaması
 *               type:
 *                 type: string
 *                 enum: [certificate, document]
 *                 description: Doküman tipi
 *               isInternational:
 *                 type: boolean
 *                 description: Uluslararası sertifika mı?
 *               imageUrlTr:
 *                 type: string
 *                 description: Türkçe görsel URL'i
 *               imageUrlEn:
 *                 type: string
 *                 description: İngilizce görsel URL'i
 *               pdfUrlTr:
 *                 type: string
 *                 description: Türkçe PDF URL'i
 *               pdfUrlEn:
 *                 type: string
 *                 description: İngilizce PDF URL'i
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: QM Document & Certificate başarıyla oluşturuldu
 */
router.post("/", qmDocumentsAndCertificatesController_1.createQMDocumentAndCertificate);
/**
 * @swagger
 * /api/qm-documents-and-certificates/{id}:
 *   put:
 *     summary: QM Document & Certificate güncelle
 *     tags: [QM Documents & Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: QM Document & Certificate ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [certificate, document]
 *               isInternational:
 *                 type: boolean
 *               imageUrlTr:
 *                 type: string
 *               imageUrlEn:
 *                 type: string
 *               pdfUrlTr:
 *                 type: string
 *               pdfUrlEn:
 *                 type: string
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: QM Document & Certificate başarıyla güncellendi
 *       404:
 *         description: QM Document & Certificate bulunamadı
 */
router.put("/:id", qmDocumentsAndCertificatesController_1.updateQMDocumentAndCertificate);
/**
 * @swagger
 * /api/qm-documents-and-certificates/{id}:
 *   delete:
 *     summary: QM Document & Certificate sil
 *     tags: [QM Documents & Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: QM Document & Certificate ID'si
 *     responses:
 *       200:
 *         description: QM Document & Certificate başarıyla silindi
 *       404:
 *         description: QM Document & Certificate bulunamadı
 */
router.delete("/:id", qmDocumentsAndCertificatesController_1.deleteQMDocumentAndCertificate);
exports.default = router;
