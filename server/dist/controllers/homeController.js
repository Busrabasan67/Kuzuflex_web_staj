"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeData = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const Market_1 = require("../entity/Market");
const Solution_1 = require("../entity/Solution");
const ProductGroup_1 = require("../entity/ProductGroup");
const Product_1 = require("../entity/Product");
const getHomeData = async (req, res) => {
    try {
        console.log('Home data fetch started');
        // Dil parametresini al
        const language = req.query.lang || 'tr';
        console.log('Language:', language);
        // Markets verilerini çek - translation'lar ile
        const marketsRepository = data_source_1.default.getRepository(Market_1.Market);
        const markets = await marketsRepository.find({
            relations: ['translations']
        });
        console.log('Markets fetched:', markets.length);
        // Solutions verilerini çek - translation'lar ile
        const solutionsRepository = data_source_1.default.getRepository(Solution_1.Solution);
        const solutions = await solutionsRepository.find({
            relations: ['translations']
        });
        // Product Groups verilerini çek - translation'lar ile
        const productGroupsRepository = data_source_1.default.getRepository(ProductGroup_1.ProductGroup);
        const productGroups = await productGroupsRepository.find({
            relations: ['translations']
        });
        console.log('Product Groups fetched:', productGroups.length);
        // Products verilerini çek - translation'lar ve grup bilgileri ile
        const productsRepository = data_source_1.default.getRepository(Product_1.Product);
        const products = await productsRepository.find({
            relations: ['translations', 'group', 'group.translations'],
            order: { id: 'ASC' }
        });
        console.log('Products fetched:', products.length);
        // Markets verilerini formatla - translation'lı
        const formattedMarkets = markets.map(market => {
            const translation = market.translations?.find(t => t.language === language);
            return {
                id: market.id,
                slug: market.slug,
                title: translation?.name || market.slug,
                description: translation?.description || 'Market description',
                imageUrl: market.imageUrl,
                order: market.id
            };
        });
        // Solutions verilerini formatla - translation'lı
        const formattedSolutions = solutions.map(solution => {
            const translation = solution.translations?.find(t => t.language === language);
            return {
                id: solution.id,
                slug: solution.slug,
                title: translation?.title || solution.slug,
                description: translation?.description || 'Solution description',
                imageUrl: solution.imageUrl,
                order: solution.id
            };
        });
        // Product Groups verilerini formatla - doğru ilişki yapısı ile
        const formattedProductGroups = productGroups.map(group => {
            const translation = group.translations?.find(t => t.language === language);
            console.log(`Formatting group: ${group.slug}, translation:`, translation);
            // Bu gruba ait ürünleri bul
            const groupProducts = products.filter(product => product.group?.id === group.id);
            console.log(`  Group ${group.slug} has ${groupProducts.length} products`);
            const formattedGroup = {
                id: group.id,
                slug: group.slug,
                title: translation?.name || group.slug,
                description: translation?.description || 'Product group description',
                imageUrl: group.imageUrl,
                order: group.id,
                // Alt ürünleri (subcategories) ekle - doğru ilişki ile
                subcategories: groupProducts.map(product => {
                    const productTranslation = product.translations?.find(t => t.language === language);
                    console.log(`    Product: ${product.slug}, translation:`, productTranslation);
                    return {
                        id: product.id,
                        slug: product.slug,
                        title: productTranslation?.title || product.slug,
                        description: productTranslation?.description || 'Product description',
                        imageUrl: product.imageUrl
                    };
                })
            };
            console.log(`Formatted group: ${formattedGroup.title}, subcategories: ${formattedGroup.subcategories.length}`);
            return formattedGroup;
        });
        // Products verilerini formatla
        const formattedProducts = products.slice(0, 6).map(product => {
            const translation = product.translations?.find(t => t.language === language);
            const groupTranslation = product.group?.translations?.find(t => t.language === language);
            return {
                id: product.id,
                slug: product.slug,
                title: translation?.title || product.slug,
                description: translation?.description || 'Product description',
                imageUrl: product.imageUrl,
                productGroup: {
                    id: product.group?.id || 0,
                    slug: product.group?.slug || 'default-group',
                    title: groupTranslation?.name || product.group?.slug || 'Default Group'
                },
                order: product.id
            };
        });
        const responseData = {
            markets: formattedMarkets,
            solutions: formattedSolutions,
            productGroups: formattedProductGroups,
            featuredProducts: formattedProducts
        };
        console.log('Sending formatted data with translations');
        res.json(responseData);
    }
    catch (error) {
        console.error('Home data fetch error:', error);
        res.status(500).json({
            message: 'Ana sayfa verileri yüklenemedi',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getHomeData = getHomeData;
