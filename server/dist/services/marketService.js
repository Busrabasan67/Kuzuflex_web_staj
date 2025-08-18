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
exports.MarketService = void 0;
const Market_1 = require("../entity/Market");
const MarketTranslation_1 = require("../entity/MarketTranslation");
const MarketContent_1 = require("../entity/MarketContent");
const ProductGroup_1 = require("../entity/ProductGroup");
const Product_1 = require("../entity/Product");
const Solution_1 = require("../entity/Solution");
const data_source_1 = __importDefault(require("../data-source"));
const typeorm_1 = require("typeorm");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Repository'ler
const marketRepository = data_source_1.default.getRepository(Market_1.Market);
const marketTranslationRepository = data_source_1.default.getRepository(MarketTranslation_1.MarketTranslation);
const marketContentRepository = data_source_1.default.getRepository(MarketContent_1.MarketContent);
const productGroupRepository = data_source_1.default.getRepository(ProductGroup_1.ProductGroup);
const productRepository = data_source_1.default.getRepository(Product_1.Product);
// Yardımcı fonksiyonlar
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
        console.error(` Dosya silinirken hata: ${filePath}`, error);
        return false;
    }
};
const getPublicFilePath = (relativePath) => {
    return path.join(__dirname, "../../public", relativePath);
};
const extractSolutionIdFromUrl = (url) => {
    if (!url)
        return null;
    const match = url.match(/\/solutions\/(\d+)/);
    return match ? parseInt(match[1]) : null;
};
class MarketService {
    // Market oluşturma sonrası otomatik içerik ekleme
    async createDefaultMarketContents(marketId, hasProducts, hasSolutions, hasCertificates, selectedProductGroups, selectedProducts, selectedSolutions) {
        try {
            console.log('🔧 Market için otomatik içerikler oluşturuluyor...');
            console.log('📊 Parametreler:', {
                marketId,
                hasProducts,
                hasSolutions,
                hasCertificates,
                selectedProductGroups,
                selectedProducts,
                selectedSolutions
            });
            const contents = [];
            let order = 1;
            // Sertifikalar her zaman eklenir
            if (hasCertificates) {
                contents.push({
                    type: 'certificate',
                    targetUrl: '/qm-documents',
                    order: order++
                });
            }
            // İletişim her zaman eklenir
            contents.push({
                type: 'contact',
                targetUrl: '/iletisim',
                order: order++
            });
            // Ürün grupları varsa ekle - sadece seçilenleri
            if (selectedProductGroups && selectedProductGroups.length > 0) {
                console.log('🔍 Seçilen ürün grupları işleniyor:', selectedProductGroups);
                const productGroups = await productGroupRepository.find({
                    where: { id: (0, typeorm_1.In)(selectedProductGroups) },
                    relations: ['translations']
                });
                console.log(' Bulunan ürün grupları:', productGroups.length);
                for (const group of productGroups) {
                    const translation = group.translations?.find(t => t.language === 'en');
                    if (translation) {
                        contents.push({
                            type: 'product',
                            targetUrl: `/products/${group.slug}`,
                            productGroupId: group.id,
                            order: order++
                        });
                        console.log(' Ürün grubu içeriği eklendi:', group.slug);
                    }
                }
            }
            // Alt ürünler varsa ekle
            if (selectedProducts && selectedProducts.length > 0) {
                console.log(' Alt ürünler işleniyor:', selectedProducts);
                const products = await productRepository.find({
                    where: { id: (0, typeorm_1.In)(selectedProducts) },
                    relations: ['translations', 'group']
                });
                console.log(' Bulunan ürünler:', products.length);
                for (const product of products) {
                    const translation = product.translations?.find(t => t.language === 'en');
                    console.log(' Ürün işleniyor:', {
                        id: product.id,
                        slug: product.slug,
                        groupSlug: product.group?.slug,
                        translation: translation?.title
                    });
                    if (translation && product.group?.slug && product.slug) {
                        contents.push({
                            type: 'product',
                            targetUrl: `/products/${product.group.slug}/${product.slug}`,
                            productId: product.id,
                            order: order++
                        });
                        console.log(' Ürün içeriği eklendi:', product.slug);
                    }
                    else {
                        console.log(' Ürün eklenmedi - eksik veri:', {
                            hasTranslation: !!translation,
                            hasGroupSlug: !!product.group?.slug,
                            hasSlug: !!product.slug
                        });
                    }
                }
            }
            // Çözümler varsa ekle - sadece seçilenleri
            if (selectedSolutions && selectedSolutions.length > 0) {
                console.log('🔍 Seçilen çözümler işleniyor:', selectedSolutions);
                const solutions = await data_source_1.default.getRepository(Solution_1.Solution).find({
                    where: { id: (0, typeorm_1.In)(selectedSolutions) },
                    relations: ['translations']
                });
                console.log(' Bulunan çözümler:', solutions.length);
                for (const solution of solutions) {
                    const translation = solution.translations?.find(t => t.language === 'en');
                    if (translation) {
                        contents.push({
                            type: 'solution',
                            targetUrl: `/solutions/${solution.slug}`,
                            solutionId: solution.id,
                            order: order++
                        });
                        console.log(' Çözüm içeriği eklendi:', solution.slug);
                    }
                }
            }
            // İçerikleri kaydet
            for (const contentData of contents) {
                const content = new MarketContent_1.MarketContent();
                content.type = contentData.type;
                content.targetUrl = contentData.targetUrl;
                content.productGroupId = contentData.productGroupId;
                content.productId = contentData.productId;
                content.solutionId = contentData.solutionId;
                content.order = contentData.order;
                content.market = { id: marketId };
                await marketContentRepository.save(content);
                console.log(` İçerik eklendi: ${contentData.type}`, {
                    type: contentData.type,
                    productGroupId: contentData.productGroupId,
                    productId: contentData.productId,
                    solutionId: contentData.solutionId,
                    targetUrl: contentData.targetUrl
                });
            }
            console.log(` Toplam ${contents.length} içerik eklendi`);
        }
        catch (error) {
            console.error(' Otomatik içerik oluşturma hatası:', error);
            throw error;
        }
    }
    // Tüm marketleri getir
    async getAllMarkets(language = 'en', isAdmin = false) {
        try {
            const markets = await marketRepository.find({
                where: isAdmin ? {} : { isActive: true },
                relations: ['translations', 'contents'],
                order: { order: 'ASC' }
            });
            const marketsWithTranslations = await Promise.all(markets.map(async (market) => {
                const translation = market.translations.find((t) => t.language === language);
                const contents = await Promise.all(market.contents.map(async (content) => {
                    let name = '';
                    // Eğer productGroupId varsa, ProductGroup'tan isim al
                    if (content.productGroupId) {
                        const productGroup = await productGroupRepository.findOne({
                            where: { id: content.productGroupId },
                            relations: ['translations']
                        });
                        if (productGroup) {
                            const productGroupTranslation = productGroup.translations?.find((t) => t.language === language);
                            name = productGroupTranslation?.name || '';
                        }
                    }
                    // Eğer productId varsa, Product'tan isim al
                    if (content.productId) {
                        const product = await productRepository.findOne({
                            where: { id: content.productId },
                            relations: ['translations']
                        });
                        if (product) {
                            const productTranslation = product.translations?.find((t) => t.language === language);
                            name = productTranslation?.title || '';
                        }
                    }
                    return {
                        id: content.id,
                        type: content.type,
                        name: name,
                        targetUrl: content.targetUrl,
                        order: content.order
                    };
                }));
                return {
                    id: market.id,
                    slug: market.slug,
                    imageUrl: market.imageUrl ? (market.imageUrl.startsWith('/') ? market.imageUrl : `/${market.imageUrl}`) : null,
                    order: market.order,
                    isActive: market.isActive,
                    hasProducts: market.hasProducts,
                    hasSolutions: market.hasSolutions,
                    hasCertificates: market.hasCertificates,
                    name: translation?.name || '',
                    description: translation?.description || '',
                    contents: contents.sort((a, b) => a.order - b.order)
                };
            }));
            return marketsWithTranslations;
        }
        catch (error) {
            console.error('Error fetching markets:', error);
            throw error;
        }
    }
    // Market'i slug ile getir
    async getMarketBySlug(slug, language = 'en') {
        try {
            console.log(' Market getiriliyor:', { slug, language });
            const market = await marketRepository.findOne({
                where: { slug },
                relations: ['translations', 'contents', 'productGroups', 'solutions']
            });
            if (!market) {
                throw new Error('Market not found');
            }
            const translation = market.translations.find((t) => t.language === language);
            console.log(' Market bulundu:', { id: market.id, slug: market.slug });
            console.log(' Market çevirisi:', translation);
            const contents = await Promise.all(market.contents.map(async (content) => {
                let name = '';
                console.log(' İçerik işleniyor:', {
                    id: content.id,
                    type: content.type,
                    productGroupId: content.productGroupId,
                    productId: content.productId
                });
                // Eğer productGroupId varsa, ProductGroup'tan isim al
                if (content.productGroupId) {
                    const productGroup = await productGroupRepository.findOne({
                        where: { id: content.productGroupId },
                        relations: ['translations']
                    });
                    if (productGroup) {
                        const productGroupTranslation = productGroup.translations?.find((t) => t.language === language);
                        name = productGroupTranslation?.name || '';
                        console.log(' ProductGroup çevirisi:', {
                            groupId: content.productGroupId,
                            translation: productGroupTranslation,
                            finalName: name
                        });
                    }
                }
                // Eğer productId varsa, Product'tan isim al
                if (content.productId) {
                    const product = await productRepository.findOne({
                        where: { id: content.productId },
                        relations: ['translations']
                    });
                    if (product) {
                        const productTranslation = product.translations?.find((t) => t.language === language);
                        name = productTranslation?.title || '';
                        console.log(' Product çevirisi:', {
                            productId: content.productId,
                            translation: productTranslation,
                            finalName: name
                        });
                    }
                }
                // Eğer solution ise, Solution'tan isim al
                if (content.type === 'solution') {
                    let solutionId = content.solutionId;
                    // Eğer solutionId yoksa, URL'den çıkar
                    if (!solutionId) {
                        solutionId = extractSolutionIdFromUrl(content.targetUrl) || undefined;
                    }
                    if (solutionId) {
                        const solution = await data_source_1.default.getRepository(Solution_1.Solution).findOne({
                            where: { id: solutionId },
                            relations: ['translations']
                        });
                        if (solution) {
                            const solutionTranslation = solution.translations?.find((t) => t.language === language);
                            name = solutionTranslation?.title || '';
                            console.log(' Solution çevirisi:', {
                                solutionId,
                                translation: solutionTranslation,
                                finalName: name
                            });
                        }
                    }
                }
                return {
                    id: content.id,
                    type: content.type,
                    name: name,
                    targetUrl: content.targetUrl,
                    order: content.order
                };
            }));
            const marketData = {
                id: market.id,
                slug: market.slug,
                imageUrl: market.imageUrl ? (market.imageUrl.startsWith('/') ? market.imageUrl : `/${market.imageUrl}`) : null,
                order: market.order,
                hasProducts: market.hasProducts,
                hasSolutions: market.hasSolutions,
                hasCertificates: market.hasCertificates,
                name: translation?.name || '',
                description: translation?.description || '',
                contents: contents.sort((a, b) => a.order - b.order),
                productGroups: market.productGroups,
                solutions: market.solutions
            };
            return marketData;
        }
        catch (error) {
            console.error('Error fetching market:', error);
            throw error;
        }
    }
    // Market'i ID ile getir
    async getMarketById(id) {
        try {
            const market = await marketRepository.findOne({
                where: { id },
                relations: ['translations']
            });
            if (!market) {
                throw new Error('Market not found');
            }
            const marketData = {
                id: market.id,
                slug: market.slug,
                imageUrl: market.imageUrl ? (market.imageUrl.startsWith('/') ? market.imageUrl : `/${market.imageUrl}`) : null,
                order: market.order,
                isActive: market.isActive,
                hasProducts: market.hasProducts,
                hasSolutions: market.hasSolutions,
                hasCertificates: market.hasCertificates,
                translations: market.translations || []
            };
            return marketData;
        }
        catch (error) {
            console.error('Error getting market by ID:', error);
            throw error;
        }
    }
    // Market oluştur
    async createMarket(marketData, translations, selectedProductGroups, selectedProducts, selectedSolutions) {
        try {
            console.log(' Market oluşturma isteği:', marketData);
            const market = new Market_1.Market();
            market.slug = marketData.slug;
            market.imageUrl = marketData.imageUrl;
            market.order = marketData.order || 0;
            market.hasProducts = marketData.hasProducts || false;
            market.hasSolutions = marketData.hasSolutions || false;
            market.hasCertificates = marketData.hasCertificates || false;
            console.log(' Market entity oluşturuldu:', {
                slug: market.slug,
                imageUrl: market.imageUrl,
                order: market.order,
                hasProducts: market.hasProducts,
                hasSolutions: market.hasSolutions,
                hasCertificates: market.hasCertificates
            });
            // Translations
            if (translations && Array.isArray(translations)) {
                console.log(' Translations işleniyor:', translations);
                market.translations = translations.map((trans) => {
                    const translation = new MarketTranslation_1.MarketTranslation();
                    translation.language = trans.language;
                    translation.name = trans.name;
                    translation.description = trans.description;
                    console.log(' Translation oluşturuldu:', {
                        language: translation.language,
                        name: translation.name,
                        description: translation.description
                    });
                    return translation;
                });
            }
            console.log(' Market veritabanına kaydediliyor...');
            const savedMarket = await marketRepository.save(market);
            console.log(' Market başarıyla kaydedildi:', savedMarket);
            // Otomatik içerikler oluştur
            await this.createDefaultMarketContents(savedMarket.id, marketData.hasProducts, marketData.hasSolutions, marketData.hasCertificates, selectedProductGroups, selectedProducts, selectedSolutions);
            return savedMarket;
        }
        catch (error) {
            console.error(' Market oluşturma hatası:', error);
            throw error;
        }
    }
    // Market güncelle
    async updateMarket(id, updateData, translations, selectedProductGroups, selectedProducts, selectedSolutions, isOnlyActiveChange = false) {
        try {
            const market = await marketRepository.findOne({
                where: { id },
                relations: ['translations']
            });
            if (!market) {
                throw new Error('Market not found');
            }
            // Resim yüklendiyse imageUrl'i güncelle ve eski resmi sil
            let finalImageUrl = updateData.imageUrl || market.imageUrl;
            if (updateData.newImageFile) {
                // Eski resim dosyasını sil
                if (market.imageUrl) {
                    const oldImagePath = getPublicFilePath(market.imageUrl);
                    const deleted = deleteFileIfExists(oldImagePath);
                    if (deleted) {
                        console.log(` Eski resim silindi: ${oldImagePath}`);
                    }
                }
                finalImageUrl = `/uploads/images/Markets/${updateData.newImageFile.filename}`;
                console.log(' Yeni resim yüklendi:', finalImageUrl);
            }
            // Sadece gönderilen alanları güncelle, diğerlerini koru
            if (updateData.slug !== undefined)
                market.slug = updateData.slug;
            if (finalImageUrl !== undefined)
                market.imageUrl = finalImageUrl;
            if (updateData.order !== undefined)
                market.order = updateData.order;
            if (updateData.isActive !== undefined) {
                console.log(' isActive güncelleniyor:', { from: market.isActive, to: updateData.isActive });
                market.isActive = updateData.isActive;
            }
            if (updateData.hasProducts !== undefined)
                market.hasProducts = updateData.hasProducts;
            if (updateData.hasSolutions !== undefined)
                market.hasSolutions = updateData.hasSolutions;
            if (updateData.hasCertificates !== undefined)
                market.hasCertificates = updateData.hasCertificates;
            // Update translations - sadece translations gönderilmişse güncelle
            if (!isOnlyActiveChange && translations && Array.isArray(translations) && translations.length > 0) {
                console.log(' Market translations güncelleniyor...');
                // Mevcut translations'ları getir
                const existingTranslations = await marketTranslationRepository.find({
                    where: { market: { id: market.id } }
                });
                console.log(' Mevcut translations:', existingTranslations.length);
                // Her translation için güncelleme yap
                for (const trans of translations) {
                    const existingTranslation = existingTranslations.find(et => et.language === trans.language);
                    if (existingTranslation) {
                        // Mevcut translation'ı güncelle
                        existingTranslation.name = trans.name;
                        existingTranslation.description = trans.description;
                        await marketTranslationRepository.save(existingTranslation);
                        console.log(' Translation güncellendi:', trans.language);
                    }
                    else {
                        // Yeni translation ekle
                        const newTranslation = new MarketTranslation_1.MarketTranslation();
                        newTranslation.language = trans.language;
                        newTranslation.name = trans.name;
                        newTranslation.description = trans.description;
                        newTranslation.market = market;
                        await marketTranslationRepository.save(newTranslation);
                        console.log(' Yeni translation eklendi:', trans.language);
                    }
                }
                // Market entity'sini güncelle (translations'ları yeniden yükle)
                market.translations = await marketTranslationRepository.find({
                    where: { market: { id: market.id } }
                });
            }
            const updatedMarket = await marketRepository.save(market);
            console.log(' Market kaydedildi:', { id: updatedMarket.id, isActive: updatedMarket.isActive });
            // İçerik seçimleri varsa, mevcut içerikleri sil ve yenilerini oluştur
            // Sadece isActive değişikliği ise içerikleri etkileme
            if (!isOnlyActiveChange && (selectedProductGroups !== undefined || selectedProducts !== undefined || selectedSolutions !== undefined)) {
                console.log(' Market içerikleri güncelleniyor...');
                // Mevcut içerikleri sil
                await marketContentRepository.delete({ market: { id: market.id } });
                // Yeni içerikleri oluştur
                await this.createDefaultMarketContents(market.id, updateData.hasProducts, updateData.hasSolutions, updateData.hasCertificates, selectedProductGroups, selectedProducts, selectedSolutions);
            }
            else if (isOnlyActiveChange) {
                console.log(' Sadece isActive değişikliği - içerikler korunuyor');
            }
            return updatedMarket;
        }
        catch (error) {
            console.error('Error updating market:', error);
            throw error;
        }
    }
    // Market sil
    async deleteMarket(id) {
        try {
            console.log(' Market silme işlemi başlatıldı, ID:', id);
            const market = await marketRepository.findOne({
                where: { id },
                relations: ['translations', 'contents']
            });
            if (!market) {
                throw new Error('Market not found');
            }
            console.log(' Market bulundu:', market.id, market.slug);
            // 1. Önce market translations'ları sil
            if (market.translations && market.translations.length > 0) {
                console.log(' Market translations siliniyor...');
                await marketTranslationRepository.delete({ market: { id: market.id } });
            }
            // 2. Market contents'leri sil
            if (market.contents && market.contents.length > 0) {
                console.log(' Market contents siliniyor...');
                await marketContentRepository.delete({ market: { id: market.id } });
            }
            // 3. Market resmini sil (eğer varsa)
            if (market.imageUrl) {
                console.log(' Market resmi siliniyor:', market.imageUrl);
                const imagePath = getPublicFilePath(market.imageUrl);
                deleteFileIfExists(imagePath);
            }
            // 4. Market'i sil
            console.log(' Market siliniyor...');
            await marketRepository.remove(market);
            console.log(' Market başarıyla silindi');
            return { message: 'Market deleted successfully' };
        }
        catch (error) {
            console.error(' Market silme hatası:', error);
            throw error;
        }
    }
    // Market içeriklerini getir
    async getMarketContents(marketId) {
        try {
            const contents = await marketContentRepository.find({
                where: { market: { id: marketId } },
                order: { order: 'ASC' }
            });
            console.log(' Market contents fetched:', contents.map(c => ({
                id: c.id,
                type: c.type,
                productGroupId: c.productGroupId,
                productId: c.productId,
                solutionId: c.solutionId,
                targetUrl: c.targetUrl
            })));
            return contents;
        }
        catch (error) {
            console.error('Error fetching market contents:', error);
            throw error;
        }
    }
    // Market içeriklerini temizle
    async clearMarketContents(marketId) {
        try {
            console.log(' Market içerikleri temizleniyor, Market ID:', marketId);
            // Belirli market'in tüm içeriklerini sil
            const deletedCount = await marketContentRepository.delete({
                market: { id: marketId }
            });
            console.log(` ${deletedCount.affected} adet market içeriği silindi`);
            return {
                success: true,
                message: `Market içerikleri başarıyla temizlendi. ${deletedCount.affected} adet içerik silindi.`,
                deletedCount: deletedCount.affected
            };
        }
        catch (error) {
            console.error(' Market içerikleri temizlenirken hata:', error);
            throw error;
        }
    }
}
exports.MarketService = MarketService;
