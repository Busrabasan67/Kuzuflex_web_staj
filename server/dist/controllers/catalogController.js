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
exports.updateCatalog = exports.deleteCatalog = exports.addCatalogToProduct = exports.getCatalogsByProduct = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const Catalog_1 = require("../entity/Catalog");
const Product_1 = require("../entity/Product");
const CatalogTranslation_1 = require("../entity/CatalogTranslation");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Yardımcı: Dosya sil
const deleteFileIfExists = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Dosya silindi: ${filePath}`);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error(`❌ Dosya silinirken hata: ${filePath}`, error);
        return false;
    }
};
const getPublicFilePath = (relativePath) => path.join(__dirname, "../../public", relativePath);
// 1. Bir alt ürünün kataloglarını getir
const getCatalogsByProduct = async (req, res) => {
    const productId = parseInt(req.params.productId);
    const lang = req.query.lang || "tr";
    try {
        const catalogs = await data_source_1.default.getRepository(Catalog_1.Catalog).find({
            where: { product: { id: productId } },
            relations: ["translations"],
        });
        const result = catalogs.map((catalog) => {
            const translation = catalog.translations?.find((t) => t.language === lang);
            return {
                id: catalog.id,
                filePath: catalog.filePath,
                name: translation?.name || "Katalog",
                translations: catalog.translations,
            };
        });
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.getCatalogsByProduct = getCatalogsByProduct;
// 2. Katalog ekle (PDF + çeviri)
const addCatalogToProduct = async (req, res) => {
    const productId = parseInt(req.params.productId);
    const { translations } = req.body;
    const file = req.file;
    // Validasyon kontrolleri
    if (!file) {
        return res.status(400).json({ message: "PDF dosyası gerekli" });
    }
    // PDF format kontrolü
    if (file.mimetype !== "application/pdf") {
        return res.status(400).json({
            message: `Sadece PDF dosyası yüklenebilir. Seçtiğiniz dosya: ${file.originalname} (${file.mimetype})`
        });
    }
    if (!productId || isNaN(productId)) {
        return res.status(400).json({ message: "Geçerli bir ürün ID'si gerekli" });
    }
    try {
        const product = await data_source_1.default.getRepository(Product_1.Product).findOneBy({ id: productId });
        if (!product) {
            return res.status(404).json({ message: "Ürün bulunamadı" });
        }
        // translations: JSON string veya array olabilir
        let parsedTranslations;
        try {
            parsedTranslations = typeof translations === "string" ? JSON.parse(translations) : translations;
        }
        catch {
            parsedTranslations = [];
        }
        // Çeviri validasyonu
        if (!Array.isArray(parsedTranslations) || parsedTranslations.length === 0) {
            return res.status(400).json({ message: "En az bir dilde çeviri gerekli" });
        }
        // TÜM DİLLER ZORUNLU
        const requiredLanguages = ['tr', 'en', 'de', 'fr'];
        const missingLanguages = requiredLanguages.filter(lang => !parsedTranslations.some((t) => t && t.language === lang && t.name && t.name.trim() !== ''));
        if (missingLanguages.length > 0) {
            const missingLangs = missingLanguages.map(lang => lang.toUpperCase()).join(', ');
            return res.status(400).json({
                message: `Aşağıdaki dillerde katalog adı zorunludur: ${missingLangs}`
            });
        }
        const catalog = new Catalog_1.Catalog();
        catalog.filePath = `uploads/catalogs/${file.filename}`;
        catalog.product = product;
        catalog.translations = [];
        // Geçerli çevirileri ekle
        catalog.translations = parsedTranslations
            .filter((t) => t && t.language && t.name && t.name.trim() !== '')
            .map((t) => {
            const tr = new CatalogTranslation_1.CatalogTranslation();
            tr.language = t.language;
            tr.name = t.name.trim();
            tr.catalog = catalog;
            return tr;
        });
        await data_source_1.default.getRepository(Catalog_1.Catalog).save(catalog);
        return res.status(201).json({ message: "Katalog eklendi" });
    }
    catch (err) {
        console.error("Katalog ekleme hatası:", err);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.addCatalogToProduct = addCatalogToProduct;
// 3. Katalog sil
const deleteCatalog = async (req, res) => {
    const catalogId = parseInt(req.params.catalogId);
    try {
        const catalog = await data_source_1.default.getRepository(Catalog_1.Catalog).findOneBy({ id: catalogId });
        if (!catalog)
            return res.status(404).json({ message: "Katalog bulunamadı" });
        // Dosyayı sil
        if (catalog.filePath) {
            const absPath = getPublicFilePath(catalog.filePath);
            deleteFileIfExists(absPath);
        }
        await data_source_1.default.getRepository(Catalog_1.Catalog).delete({ id: catalogId });
        return res.json({ message: "Katalog silindi" });
    }
    catch (err) {
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.deleteCatalog = deleteCatalog;
// 4. Katalog güncelle (çeviri/dosya)
const updateCatalog = async (req, res) => {
    const catalogId = parseInt(req.params.catalogId);
    const { translations } = req.body;
    const file = req.file;
    // Validasyon kontrolleri
    if (!catalogId || isNaN(catalogId)) {
        return res.status(400).json({ message: "Geçerli bir katalog ID'si gerekli" });
    }
    // PDF format kontrolü (sadece dosya varsa)
    if (file && file.mimetype !== "application/pdf") {
        return res.status(400).json({
            message: `Sadece PDF dosyası yüklenebilir. Seçtiğiniz dosya: ${file.originalname} (${file.mimetype})`
        });
    }
    try {
        const catalogRepo = data_source_1.default.getRepository(Catalog_1.Catalog);
        const catalog = await catalogRepo.findOne({
            where: { id: catalogId },
            relations: ["translations"],
        });
        if (!catalog) {
            return res.status(404).json({ message: "Katalog bulunamadı" });
        }
        // Eski dosyayı sil ve yeni dosyayı kaydet (sadece yeni dosya varsa)
        if (file) {
            if (catalog.filePath) {
                const absPath = getPublicFilePath(catalog.filePath);
                deleteFileIfExists(absPath);
            }
            catalog.filePath = `uploads/catalogs/${file.filename}`;
        }
        // Çevirileri güncelle
        let parsedTranslations;
        try {
            parsedTranslations = typeof translations === "string" ? JSON.parse(translations) : translations;
        }
        catch {
            parsedTranslations = [];
        }
        // Çeviri validasyonu
        if (Array.isArray(parsedTranslations) && parsedTranslations.length > 0) {
            // TÜM DİLLER ZORUNLU
            const requiredLanguages = ['tr', 'en', 'de', 'fr'];
            const missingLanguages = requiredLanguages.filter(lang => !parsedTranslations.some((t) => t && t.language === lang && t.name && t.name.trim() !== ''));
            if (missingLanguages.length > 0) {
                const missingLangs = missingLanguages.map(lang => lang.toUpperCase()).join(', ');
                return res.status(400).json({
                    message: `Aşağıdaki dillerde katalog adı zorunludur: ${missingLangs}`
                });
            }
            // Mevcut çevirileri güncelle veya yeni ekle
            for (const translationData of parsedTranslations) {
                if (!translationData.language || !translationData.name || translationData.name.trim() === '') {
                    continue; // Geçersiz çevirileri atla
                }
                const existingTranslation = catalog.translations?.find((t) => t.language === translationData.language);
                if (existingTranslation) {
                    // Mevcut çeviriyi güncelle
                    existingTranslation.name = translationData.name.trim();
                }
                else {
                    // Yeni çeviri ekle
                    const newTranslation = new CatalogTranslation_1.CatalogTranslation();
                    newTranslation.language = translationData.language;
                    newTranslation.name = translationData.name.trim();
                    newTranslation.catalog = catalog;
                    catalog.translations.push(newTranslation);
                }
            }
        }
        await catalogRepo.save(catalog);
        return res.json({ message: "Katalog güncellendi" });
    }
    catch (err) {
        console.error("Katalog güncelleme hatası:", err);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.updateCatalog = updateCatalog;
