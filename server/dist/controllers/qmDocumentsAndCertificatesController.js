"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQMDocumentAndCertificate = exports.updateQMDocumentAndCertificate = exports.createQMDocumentAndCertificate = exports.getQMDocumentAndCertificateById = exports.getAllQMDocumentsAndCertificates = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const QMDocumentsAndCertificates_1 = require("../entity/QMDocumentsAndCertificates");
const QMDocumentsAndCertificatesTranslation_1 = require("../entity/QMDocumentsAndCertificatesTranslation");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Dosya silme yardımcı fonksiyonu
const deleteFileIfExists = (filePath) => {
    try {
        console.log(`🔍 Dosya kontrol ediliyor: ${filePath}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Dosya silindi: ${filePath}`);
            return true;
        }
        else {
            console.log(`⚠️ Dosya bulunamadı: ${filePath}`);
            return false;
        }
    }
    catch (error) {
        console.error(`❌ Dosya silinirken hata: ${filePath}`, error);
        return false;
    }
};
// Dosya yolu oluşturma yardımcı fonksiyonu
const getPublicFilePath = (relativePath) => {
    return path.join(__dirname, "../../public", relativePath);
};
// Tüm QM Documents'ları getir
const getAllQMDocumentsAndCertificates = async (req, res) => {
    const lang = req.query.lang || "tr";
    try {
        const documentRepo = data_source_1.default.getRepository(QMDocumentsAndCertificates_1.QMDocumentsAndCertificates);
        const documents = await documentRepo.find({
            relations: ["translations"],
            order: {
                type: "ASC",
                isInternational: "DESC",
                createdAt: "DESC"
            }
        });
        const formattedDocuments = documents.map((doc) => {
            // Uluslararası sertifikalar için tüm dillerde göster - EN dosyalarını kullan
            if (doc.isInternational) {
                const translation = doc.translations?.find((t) => t.language === lang) ||
                    doc.translations?.find((t) => t.language === "en") ||
                    doc.translations?.[0];
                return {
                    id: doc.id,
                    title: translation?.title || "Untitled",
                    description: translation?.description || "",
                    imageUrl: doc.imageUrlEn ? (doc.imageUrlEn.startsWith('/') ? doc.imageUrlEn : `/${doc.imageUrlEn}`) : null, // Uluslararası sertifikalar için her zaman EN dosyası
                    pdfUrl: doc.pdfUrlEn ? (doc.pdfUrlEn.startsWith('/') ? doc.pdfUrlEn : `/${doc.pdfUrlEn}`) : null, // Uluslararası sertifikalar için her zaman EN dosyası
                    type: doc.type,
                    isInternational: doc.isInternational,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt
                };
            }
            else {
                // Dokümantasyonlar için sadece tr ve en dillerinde göster
                if (lang === "tr" || lang === "en") {
                    const translation = doc.translations?.find((t) => t.language === lang);
                    if (translation) {
                        return {
                            id: doc.id,
                            title: translation.title || "Untitled",
                            description: translation.description || "",
                            imageUrl: lang === 'tr' ?
                                (doc.imageUrlTr ? (doc.imageUrlTr.startsWith('/') ? doc.imageUrlTr : `/${doc.imageUrlTr}`) : null) :
                                (doc.imageUrlEn ? (doc.imageUrlEn.startsWith('/') ? doc.imageUrlEn : `/${doc.imageUrlEn}`) : null),
                            pdfUrl: lang === 'tr' ?
                                (doc.pdfUrlTr ? (doc.pdfUrlTr.startsWith('/') ? doc.pdfUrlTr : `/${doc.pdfUrlTr}`) : null) :
                                (doc.pdfUrlEn ? (doc.pdfUrlEn.startsWith('/') ? doc.pdfUrlEn : `/${doc.pdfUrlEn}`) : null),
                            type: doc.type,
                            isInternational: doc.isInternational,
                            createdAt: doc.createdAt,
                            updatedAt: doc.updatedAt
                        };
                    }
                }
                else {
                    // Diğer dillerde en versiyonunu göster
                    const translation = doc.translations?.find((t) => t.language === "en");
                    if (translation) {
                        return {
                            id: doc.id,
                            title: translation.title || "Untitled",
                            description: translation.description || "",
                            imageUrl: doc.imageUrlEn ? (doc.imageUrlEn.startsWith('/') ? doc.imageUrlEn : `/${doc.imageUrlEn}`) : null,
                            pdfUrl: doc.pdfUrlEn ? (doc.pdfUrlEn.startsWith('/') ? doc.pdfUrlEn : `/${doc.pdfUrlEn}`) : null,
                            type: doc.type,
                            isInternational: doc.isInternational,
                            createdAt: doc.createdAt,
                            updatedAt: doc.updatedAt
                        };
                    }
                }
            }
            return null;
        }).filter(Boolean);
        return res.json(formattedDocuments);
    }
    catch (err) {
        console.error("QM Documents API hatası:", err);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.getAllQMDocumentsAndCertificates = getAllQMDocumentsAndCertificates;
// Belirli bir QM Document'ı getir
const getQMDocumentAndCertificateById = async (req, res) => {
    const { id } = req.params;
    const lang = req.query.lang || "tr";
    try {
        const documentRepo = data_source_1.default.getRepository(QMDocumentsAndCertificates_1.QMDocumentsAndCertificates);
        const document = await documentRepo.findOne({
            where: { id: parseInt(id) },
            relations: ["translations"],
        });
        if (!document) {
            return res.status(404).json({ message: "Doküman bulunamadı" });
        }
        const translation = document.translations?.find((t) => t.language === lang) ||
            document.translations?.find((t) => t.language === "en") ||
            document.translations?.[0];
        // Uluslararası sertifikalar için her zaman EN dosyalarını kullan
        const imageUrl = document.isInternational ? document.imageUrlEn : (lang === 'tr' ? document.imageUrlTr : document.imageUrlEn);
        const pdfUrl = document.isInternational ? document.pdfUrlEn : (lang === 'tr' ? document.pdfUrlTr : document.pdfUrlEn);
        return res.json({
            id: document.id,
            title: translation?.title || "Untitled",
            description: translation?.description || "",
            imageUrl: imageUrl,
            pdfUrl: pdfUrl,
            type: document.type,
            isInternational: document.isInternational,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
        });
    }
    catch (err) {
        console.error("QM Document API hatası:", err);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.getQMDocumentAndCertificateById = getQMDocumentAndCertificateById;
// Yeni QM Document oluştur
const createQMDocumentAndCertificate = async (req, res) => {
    try {
        const documentRepo = data_source_1.default.getRepository(QMDocumentsAndCertificates_1.QMDocumentsAndCertificates);
        const translationRepo = data_source_1.default.getRepository(QMDocumentsAndCertificatesTranslation_1.QMDocumentsAndCertificatesTranslations);
        const { title, description, type, isInternational, translations } = req.body;
        const newDocument = documentRepo.create({
            type: type || 'document',
            isInternational: isInternational || false,
            imageUrlTr: req.body.imageUrlTr,
            imageUrlEn: req.body.imageUrlEn,
            pdfUrlTr: req.body.pdfUrlTr,
            pdfUrlEn: req.body.pdfUrlEn
        });
        const savedDocument = await documentRepo.save(newDocument);
        // Çevirileri oluştur
        if (translations && Array.isArray(translations)) {
            for (const trans of translations) {
                const translation = translationRepo.create({
                    language: trans.language,
                    title: trans.title,
                    description: trans.description,
                    document: savedDocument
                });
                await translationRepo.save(translation);
            }
        }
        return res.status(201).json({
            message: "QM Document başarıyla oluşturuldu",
            document: savedDocument
        });
    }
    catch (err) {
        console.error("QM Document oluşturma hatası:", err);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.createQMDocumentAndCertificate = createQMDocumentAndCertificate;
// QM Document güncelle
const updateQMDocumentAndCertificate = async (req, res) => {
    const { id } = req.params;
    try {
        console.log('=== UPDATE REQUEST ===');
        console.log('ID:', id);
        console.log('Body:', req.body);
        const documentRepo = data_source_1.default.getRepository(QMDocumentsAndCertificates_1.QMDocumentsAndCertificates);
        const translationRepo = data_source_1.default.getRepository(QMDocumentsAndCertificatesTranslation_1.QMDocumentsAndCertificatesTranslations);
        const document = await documentRepo.findOne({
            where: { id: parseInt(id) },
            relations: ["translations"]
        });
        if (!document) {
            return res.status(404).json({ message: "Doküman bulunamadı" });
        }
        console.log('Current document:', {
            imageUrlTr: document.imageUrlTr,
            imageUrlEn: document.imageUrlEn,
            pdfUrlTr: document.pdfUrlTr,
            pdfUrlEn: document.pdfUrlEn
        });
        // Eski dosyaları sil
        const oldImageUrlTr = document.imageUrlTr;
        const oldImageUrlEn = document.imageUrlEn;
        const oldPdfUrlTr = document.pdfUrlTr;
        const oldPdfUrlEn = document.pdfUrlEn;
        // Ana doküman bilgilerini güncelle
        if (req.body.type !== undefined)
            document.type = req.body.type;
        if (req.body.isInternational !== undefined)
            document.isInternational = req.body.isInternational;
        // Dosya yollarını güncelle
        console.log('Checking file paths in request body:');
        console.log('imageUrlTr:', req.body.imageUrlTr, 'type:', typeof req.body.imageUrlTr);
        console.log('imageUrlEn:', req.body.imageUrlEn, 'type:', typeof req.body.imageUrlEn);
        console.log('pdfUrlTr:', req.body.pdfUrlTr, 'type:', typeof req.body.pdfUrlTr);
        console.log('pdfUrlEn:', req.body.pdfUrlEn, 'type:', typeof req.body.pdfUrlEn);
        if (req.body.imageUrlTr !== undefined) {
            console.log('Updating imageUrlTr from', document.imageUrlTr, 'to', req.body.imageUrlTr);
            document.imageUrlTr = req.body.imageUrlTr;
        }
        if (req.body.imageUrlEn !== undefined) {
            console.log('Updating imageUrlEn from', document.imageUrlEn, 'to', req.body.imageUrlEn);
            document.imageUrlEn = req.body.imageUrlEn;
        }
        if (req.body.pdfUrlTr !== undefined) {
            console.log('Updating pdfUrlTr from', document.pdfUrlTr, 'to', req.body.pdfUrlTr);
            document.pdfUrlTr = req.body.pdfUrlTr;
        }
        if (req.body.pdfUrlEn !== undefined) {
            console.log('Updating pdfUrlEn from', document.pdfUrlEn, 'to', req.body.pdfUrlEn);
            document.pdfUrlEn = req.body.pdfUrlEn;
        }
        console.log('Updated document:', {
            imageUrlTr: document.imageUrlTr,
            imageUrlEn: document.imageUrlEn,
            pdfUrlTr: document.pdfUrlTr,
            pdfUrlEn: document.pdfUrlEn
        });
        // updatedAt'i manuel olarak güncelle
        document.updatedAt = new Date();
        console.log('UpdatedAt set to:', document.updatedAt);
        await documentRepo.save(document);
        // Çevirileri güncelle
        if (req.body.translations && Array.isArray(req.body.translations)) {
            for (const trans of req.body.translations) {
                let translation = document.translations?.find(t => t.language === trans.language);
                if (translation) {
                    translation.title = trans.title;
                    translation.description = trans.description;
                    await translationRepo.save(translation);
                }
                else {
                    const newTranslation = translationRepo.create({
                        language: trans.language,
                        title: trans.title,
                        description: trans.description,
                        document: document
                    });
                    await translationRepo.save(newTranslation);
                }
            }
        }
        // Eski dosyaları sil (yeni dosya yüklendiyse)
        console.log('=== DOSYA SİLME İŞLEMİ ===');
        console.log('Eski dosyalar:', { oldImageUrlTr, oldImageUrlEn, oldPdfUrlTr, oldPdfUrlEn });
        console.log('Yeni dosyalar:', {
            imageUrlTr: req.body.imageUrlTr,
            imageUrlEn: req.body.imageUrlEn,
            pdfUrlTr: req.body.pdfUrlTr,
            pdfUrlEn: req.body.pdfUrlEn
        });
        if (req.body.imageUrlTr && oldImageUrlTr && req.body.imageUrlTr !== oldImageUrlTr) {
            console.log('Eski TR resmi siliniyor:', oldImageUrlTr);
            deleteFileIfExists(getPublicFilePath(oldImageUrlTr));
        }
        if (req.body.imageUrlEn && oldImageUrlEn && req.body.imageUrlEn !== oldImageUrlEn) {
            console.log('Eski EN resmi siliniyor:', oldImageUrlEn);
            deleteFileIfExists(getPublicFilePath(oldImageUrlEn));
        }
        if (req.body.pdfUrlTr && oldPdfUrlTr && req.body.pdfUrlTr !== oldPdfUrlTr) {
            console.log('Eski TR PDF siliniyor:', oldPdfUrlTr);
            deleteFileIfExists(getPublicFilePath(oldPdfUrlTr));
        }
        if (req.body.pdfUrlEn && oldPdfUrlEn && req.body.pdfUrlEn !== oldPdfUrlEn) {
            console.log('Eski EN PDF siliniyor:', oldPdfUrlEn);
            deleteFileIfExists(getPublicFilePath(oldPdfUrlEn));
        }
        return res.json({
            message: "QM Document başarıyla güncellendi",
            document: document
        });
    }
    catch (err) {
        console.error("QM Document güncelleme hatası:", err);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.updateQMDocumentAndCertificate = updateQMDocumentAndCertificate;
// QM Document sil
const deleteQMDocumentAndCertificate = async (req, res) => {
    const { id } = req.params;
    try {
        const documentRepo = data_source_1.default.getRepository(QMDocumentsAndCertificates_1.QMDocumentsAndCertificates);
        const document = await documentRepo.findOne({
            where: { id: parseInt(id) }
        });
        if (!document) {
            return res.status(404).json({ message: "Doküman bulunamadı" });
        }
        // Dosyaları sil
        if (document.imageUrlTr) {
            deleteFileIfExists(getPublicFilePath(document.imageUrlTr));
        }
        if (document.imageUrlEn) {
            deleteFileIfExists(getPublicFilePath(document.imageUrlEn));
        }
        if (document.pdfUrlTr) {
            deleteFileIfExists(getPublicFilePath(document.pdfUrlTr));
        }
        if (document.pdfUrlEn) {
            deleteFileIfExists(getPublicFilePath(document.pdfUrlEn));
        }
        await documentRepo.remove(document);
        return res.json({ message: "QM Document başarıyla silindi" });
    }
    catch (err) {
        console.error("QM Document silme hatası:", err);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.deleteQMDocumentAndCertificate = deleteQMDocumentAndCertificate;
