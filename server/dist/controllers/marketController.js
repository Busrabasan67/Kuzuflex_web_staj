"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearMarketContents = exports.getAvailableSolutions = exports.getAvailableProductGroups = exports.getMarketContents = exports.deleteMarketContent = exports.updateMarketContent = exports.createMarketContent = exports.deleteMarket = exports.updateMarket = exports.createMarket = exports.getMarketById = exports.getMarketBySlug = exports.getAllMarkets = void 0;
const marketService_1 = require("../services/marketService");
const productGroupController_1 = require("./productGroupController");
const solutionController_1 = require("./solutionController");
const marketService = new marketService_1.MarketService();
const getAllMarkets = async (req, res) => {
    try {
        const { language = 'en' } = req.query;
        const isAdmin = req.query.admin === 'true';
        const markets = await marketService.getAllMarkets(language, isAdmin);
        res.json(markets);
    }
    catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllMarkets = getAllMarkets;
const getMarketBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { language = 'en' } = req.query;
        const market = await marketService.getMarketBySlug(slug, language);
        res.json(market);
    }
    catch (error) {
        console.error('Error fetching market:', error);
        if (error instanceof Error && error.message === 'Market not found') {
            res.status(404).json({ error: 'Market not found' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.getMarketBySlug = getMarketBySlug;
const getMarketById = async (req, res) => {
    try {
        const { id } = req.params;
        const market = await marketService.getMarketById(parseInt(id));
        res.json(market);
    }
    catch (error) {
        console.error('Error getting market by ID:', error);
        if (error instanceof Error && error.message === 'Market not found') {
            res.status(404).json({ error: 'Market not found' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.getMarketById = getMarketById;
const createMarket = async (req, res) => {
    try {
        console.log('📥 Market oluşturma isteği:', req.body);
        // FormData'dan gelen string değerleri parse et
        const slug = req.body.slug;
        const imageUrl = req.body.imageUrl;
        const order = req.body.order ? parseInt(req.body.order) : 0;
        const hasProducts = req.body.hasProducts === 'true';
        const hasSolutions = req.body.hasSolutions === 'true';
        const hasCertificates = req.body.hasCertificates === 'true';
        const translations = req.body.translations ? JSON.parse(req.body.translations) : [];
        const selectedProductGroups = req.body.selectedProductGroups ? JSON.parse(req.body.selectedProductGroups) : [];
        const selectedProducts = req.body.selectedProducts ? JSON.parse(req.body.selectedProducts) : [];
        const selectedSolutions = req.body.selectedSolutions ? JSON.parse(req.body.selectedSolutions) : [];
        // Resim yüklendiyse imageUrl'i güncelle
        let finalImageUrl = imageUrl || '';
        if (req.file) {
            finalImageUrl = `/uploads/images/Markets/${req.file.filename}`;
            console.log('📸 Yeni resim yüklendi:', finalImageUrl);
        }
        const marketData = {
            slug,
            imageUrl: finalImageUrl,
            order,
            hasProducts,
            hasSolutions,
            hasCertificates
        };
        const savedMarket = await marketService.createMarket(marketData, translations, selectedProductGroups, selectedProducts, selectedSolutions);
        res.status(201).json(savedMarket);
    }
    catch (error) {
        console.error('❌ Market oluşturma hatası:', error);
        console.error('❌ Hata detayları:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createMarket = createMarket;
const updateMarket = async (req, res) => {
    try {
        const { id } = req.params;
        // FormData'dan gelen string değerleri parse et
        const slug = req.body.slug;
        const imageUrl = req.body.imageUrl;
        const order = req.body.order ? parseInt(req.body.order) : 0;
        const isActive = req.body.isActive === 'true' || req.body.isActive === true;
        const hasProducts = req.body.hasProducts === 'true' || req.body.hasProducts === true;
        const hasSolutions = req.body.hasSolutions === 'true' || req.body.hasSolutions === true;
        const hasCertificates = req.body.hasCertificates === 'true' || req.body.hasCertificates === true;
        const translations = req.body.translations ? JSON.parse(req.body.translations) : [];
        const selectedProductGroups = req.body.selectedProductGroups ? JSON.parse(req.body.selectedProductGroups) : [];
        const selectedProducts = req.body.selectedProducts ? JSON.parse(req.body.selectedProducts) : [];
        const selectedSolutions = req.body.selectedSolutions ? JSON.parse(req.body.selectedSolutions) : [];
        // Sadece isActive değişikliği kontrolü
        const isOnlyActiveChange = Object.keys(req.body).length === 1 && req.body.isActive !== undefined;
        console.log('📥 Market güncelleme isteği:', {
            id,
            rawIsActive: req.body.isActive,
            parsedIsActive: isActive,
            isOnlyActiveChange,
            hasProducts,
            hasSolutions,
            hasCertificates,
            selectedProductGroups,
            selectedProducts,
            selectedSolutions
        });
        const updateData = {
            slug,
            imageUrl,
            order,
            isActive,
            hasProducts,
            hasSolutions,
            hasCertificates,
            newImageFile: req.file
        };
        const updatedMarket = await marketService.updateMarket(parseInt(id), updateData, translations, selectedProductGroups, selectedProducts, selectedSolutions, isOnlyActiveChange);
        res.json(updatedMarket);
    }
    catch (error) {
        console.error('Error updating market:', error);
        if (error instanceof Error && error.message === 'Market not found') {
            res.status(404).json({ error: 'Market not found' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.updateMarket = updateMarket;
const deleteMarket = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await marketService.deleteMarket(parseInt(id));
        res.json(result);
    }
    catch (error) {
        console.error('❌ Market silme hatası:', error);
        if (error instanceof Error && error.message === 'Market not found') {
            res.status(404).json({ error: 'Market not found' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.deleteMarket = deleteMarket;
// Market Content CRUD operations
const createMarketContent = async (req, res) => {
    try {
        const { marketId } = req.params;
        const { type, targetUrl, productGroupId, productId, order } = req.body;
        const market = await marketService.getMarketById(parseInt(marketId));
        if (!market) {
            return res.status(404).json({ error: 'Market not found' });
        }
        // Bu fonksiyon artık kullanılmıyor, otomatik içerik oluşturma kullanılıyor
        res.status(400).json({ error: 'This endpoint is deprecated. Use market update instead.' });
    }
    catch (error) {
        console.error('Error creating market content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createMarketContent = createMarketContent;
const updateMarketContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, targetUrl, productGroupId, productId, order } = req.body;
        // Bu fonksiyon artık kullanılmıyor, otomatik içerik oluşturma kullanılıyor
        res.status(400).json({ error: 'This endpoint is deprecated. Use market update instead.' });
    }
    catch (error) {
        console.error('Error updating market content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateMarketContent = updateMarketContent;
const deleteMarketContent = async (req, res) => {
    try {
        const { id } = req.params;
        // Bu fonksiyon artık kullanılmıyor, otomatik içerik oluşturma kullanılıyor
        res.status(400).json({ error: 'This endpoint is deprecated. Use market update instead.' });
    }
    catch (error) {
        console.error('Error deleting market content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteMarketContent = deleteMarketContent;
// Market içeriklerini getir
const getMarketContents = async (req, res) => {
    try {
        const { marketId } = req.params;
        const contents = await marketService.getMarketContents(parseInt(marketId));
        res.json(contents);
    }
    catch (error) {
        console.error('Error fetching market contents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMarketContents = getMarketContents;
// Mevcut ürün gruplarını getir - Mevcut controller fonksiyonunu kullan
const getAvailableProductGroups = async (req, res) => {
    try {
        // Mevcut getAllGroups fonksiyonunu çağır
        await (0, productGroupController_1.getAllGroups)(req, res);
    }
    catch (error) {
        console.error('Error fetching product groups:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAvailableProductGroups = getAvailableProductGroups;
// Mevcut çözümleri getir - Mevcut controller fonksiyonunu kullan
const getAvailableSolutions = async (req, res) => {
    try {
        // Mevcut getAllSolutions fonksiyonunu çağır
        await (0, solutionController_1.getAllSolutions)(req, res);
    }
    catch (error) {
        console.error('Error fetching solutions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAvailableSolutions = getAvailableSolutions;
// Market içeriklerini temizleme endpoint'i
const clearMarketContents = async (req, res) => {
    try {
        const { marketId } = req.params;
        const result = await marketService.clearMarketContents(parseInt(marketId));
        res.json(result);
    }
    catch (error) {
        console.error('❌ Market içerikleri temizlenirken hata:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.clearMarketContents = clearMarketContents;
