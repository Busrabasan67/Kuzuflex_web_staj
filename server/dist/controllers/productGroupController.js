"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminProductGroups = exports.deleteProductGroup = exports.updateProductGroup = exports.createProductGroupWithFormData = exports.getProductsByGroupSlug = exports.getProductsByGroupId = exports.getAllGroups = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const ProductGroup_1 = require("../entity/ProductGroup");
const Product_1 = require("../entity/Product");
const productGroupService_1 = require("../services/productGroupService");
const productGroupService = new productGroupService_1.ProductGroupService();
// fonksiyonu projende navbar menüsünü beslemek için tasarlanmış ana fonksiyondur. 
const getAllGroups = async (req, res) => {
    const lang = req.query.lang || "tr";
    try {
        // Veritabanından ilgili dilde çevirisiyle birlikte grupları al
        const groups = await data_source_1.default.getRepository(ProductGroup_1.ProductGroup)
            .createQueryBuilder("group")
            .leftJoinAndSelect("group.translations", "groupTranslation", "groupTranslation.language = :lang", { lang })
            .leftJoinAndSelect("group.products", "product")
            .leftJoinAndSelect("product.translations", "productTranslation", "productTranslation.language = :lang", { lang })
            .getMany();
        // Her grup için, ortak alanlar ve ilgili dilde çeviri döndür
        const result = groups.map((group) => ({
            id: group.id, // Grup ID'si
            slug: group.slug, // SEO dostu URL slug'ı
            imageUrl: group.imageUrl || null, // Grup görseli
            standard: group.standard || null, // Grup standardı
            // Sadece ilgili dildeki çeviri
            translation: group.translations?.[0]
                ? {
                    language: group.translations[0].language,
                    name: group.translations[0].name,
                    description: group.translations[0].description,
                }
                : null,
            // Alt ürünler (subcategories)
            subcategories: (group.products || []).map((product) => {
                const translation = product.translations?.find(t => t.language === lang);
                return {
                    id: product.id, // Ürün ID'si
                    slug: product.slug, // Ürün slug'ı
                    title: translation?.title, // Ürün adı (çeviri)
                    description: translation?.description, // Ürün açıklaması (çeviri)
                    imageUrl: product.imageUrl || null, // Ürün görseli
                    standard: product.standard || null, // Ürün standardı
                    key: `sub-${group.id}-${product.id}` // Anahtar
                };
            }),
        }));
        // Sonucu JSON olarak döndür
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(" Grup verileri alınamadı:", error);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.getAllGroups = getAllGroups;
// Grup ID ile ürünleri getirme (backward compatibility için)
const getProductsByGroupId = async (req, res) => {
    const lang = req.query.lang || "tr";
    const groupId = parseInt(req.params.groupId);
    const products = await data_source_1.default.getRepository(Product_1.Product)
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.translations", "translation", "translation.language = :lang", { lang })
        .leftJoinAndSelect("product.catalogs", "catalog")
        .leftJoinAndSelect("catalog.translations", "catalogTranslation", "catalogTranslation.language = :lang", { lang })
        .where("product.groupId = :groupId", { groupId })
        .getMany();
    const result = products.map((product) => ({
        id: product.id,
        slug: product.slug,
        title: product.translations?.[0]?.title,
        description: product.translations?.[0]?.description,
        imageUrl: product.imageUrl,
        standard: product.standard,
        catalogs: (product.catalogs || []).map((catalog) => ({
            id: catalog.id,
            name: catalog.translations?.[0]?.name || "Katalog",
            filePath: catalog.filePath,
        })),
        key: `sub-${groupId}-${product.id}`,
    }));
    return res.status(200).json(result);
};
exports.getProductsByGroupId = getProductsByGroupId;
// Grup slug ile ürünleri getirme (yeni slug sistemi)
const getProductsByGroupSlug = async (req, res) => {
    const lang = req.query.lang || "tr";
    const { groupSlug } = req.params;
    try {
        const products = await data_source_1.default.getRepository(Product_1.Product)
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.group", "group")
            .leftJoinAndSelect("product.translations", "translation", "translation.language = :lang", { lang })
            .leftJoinAndSelect("product.catalogs", "catalog")
            .leftJoinAndSelect("catalog.translations", "catalogTranslation", "catalogTranslation.language = :lang", { lang })
            .where("group.slug = :groupSlug", { groupSlug })
            .getMany();
        const result = products.map((product) => ({
            id: product.id,
            slug: product.slug,
            title: product.translations?.[0]?.title,
            description: product.translations?.[0]?.description,
            imageUrl: product.imageUrl,
            standard: product.standard,
            catalogs: (product.catalogs || []).map((catalog) => ({
                id: catalog.id,
                name: catalog.translations?.[0]?.name || "Katalog",
                filePath: catalog.filePath,
            })),
            key: `sub-${product.group?.slug}-${product.slug}`,
        }));
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(" Grup slug ile ürünler alınamadı:", error);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.getProductsByGroupSlug = getProductsByGroupSlug;
const createProductGroupWithFormData = async (req, res) => {
    try {
        console.log("📥 Gelen body:", req.body);
        console.log("📁 Dosya var mı:", !!req.file);
        // req.body kontrolü
        if (!req.body) {
            return res.status(400).json({ message: "Form verileri alınamadı." });
        }
        // FormData'dan gelen verileri al
        const marketData = {
            imageUrl: req.body.imageUrl,
            standard: req.body.standard,
            slug: req.body.slug
        };
        // 🔒 Güvenli parse
        let translations;
        try {
            if (!req.body.translations) {
                return res.status(400).json({ message: "translations alanı eksik!" });
            }
            translations = JSON.parse(req.body.translations);
        }
        catch (err) {
            console.error(" JSON parse hatası:", err);
            return res.status(400).json({ message: "translations formatı hatalı. JSON.stringify ile gönderilmeli." });
        }
        if (!translations || !Array.isArray(translations) || translations.length !== 4) {
            return res.status(400).json({ message: "4 dilde çeviri zorunludur." });
        }
        const result = await productGroupService.createProductGroup(marketData, translations, req.file);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error(" Grup eklenemedi:", error);
        return res.status(500).json({ message: "Sunucu hatası", detail: error.message });
    }
};
exports.createProductGroupWithFormData = createProductGroupWithFormData;
// ProductGroup güncelleme fonksiyonu (resim dahil)
const updateProductGroup = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id);
        console.log(" Güncelleme ID:", groupId);
        console.log(" Gelen body:", req.body);
        console.log(" Dosya var mı:", !!req.file);
        if (!groupId || isNaN(groupId)) {
            return res.status(400).json({ message: "Geçerli bir ID gerekli" });
        }
        // FormData'dan gelen verileri al
        const updateData = {
            imageUrl: req.body.imageUrl,
            standard: req.body.standard,
            slug: req.body.slug
        };
        // 🔒 Güvenli parse
        let translations;
        try {
            if (!req.body.translations) {
                return res.status(400).json({ message: "translations alanı eksik!" });
            }
            translations = JSON.parse(req.body.translations);
        }
        catch (err) {
            console.error(" JSON parse hatası:", err);
            return res.status(400).json({ message: "translations formatı hatalı." });
        }
        if (!translations || !Array.isArray(translations) || translations.length !== 4) {
            return res.status(400).json({ message: "4 dilde çeviri zorunludur." });
        }
        const result = await productGroupService.updateProductGroup(groupId, updateData, translations, req.file);
        return res.status(200).json({
            message: "Grup başarıyla güncellendi",
            group: result,
            imageUrl: result.imageUrl
        });
    }
    catch (error) {
        console.error(" Grup güncellenemedi:", error);
        return res.status(500).json({ message: "Sunucu hatası", detail: error.message });
    }
};
exports.updateProductGroup = updateProductGroup;
// ProductGroup silme fonksiyonu
const deleteProductGroup = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id);
        console.log(" Silinecek grup ID:", groupId);
        if (!groupId || isNaN(groupId)) {
            return res.status(400).json({ message: "Geçerli bir ID gerekli" });
        }
        const result = await productGroupService.deleteProductGroup(groupId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(" Grup silinemedi:", error);
        return res.status(500).json({ message: "Sunucu hatası", detail: error.message });
    }
};
exports.deleteProductGroup = deleteProductGroup;
// Admin paneli için üst kategorileri listeleme fonksiyonu
const getAdminProductGroups = async (req, res) => {
    try {
        const result = await productGroupService.getAllProductGroupsForAdmin();
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(" Admin grup listesi alınamadı:", error);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
};
exports.getAdminProductGroups = getAdminProductGroups;
