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
exports.ProductService = void 0;
const Product_1 = require("../entity/Product");
const ProductTranslation_1 = require("../entity/ProductTranslation");
const ProductGroup_1 = require("../entity/ProductGroup");
const Catalog_1 = require("../entity/Catalog");
const data_source_1 = __importDefault(require("../data-source"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Repository'ler
const productRepository = data_source_1.default.getRepository(Product_1.Product);
const productTranslationRepository = data_source_1.default.getRepository(ProductTranslation_1.ProductTranslation);
const productGroupRepository = data_source_1.default.getRepository(ProductGroup_1.ProductGroup);
const catalogRepository = data_source_1.default.getRepository(Catalog_1.Catalog);
// Yardımcı fonksiyonlar
const deleteFileIfExists = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(` Dosya silindi: ${filePath}`);
            return true;
        }
    }
    catch (error) {
        console.error(` Dosya silinirken hata: ${filePath}`, error);
    }
    return false;
};
const getPublicFilePath = (relativePath) => {
    return path.join(process.cwd(), 'public', relativePath);
};
class ProductService {
    // Tüm ürünleri getir (admin paneli için)
    async getAllProductsForAdmin(hasCatalog) {
        try {
            let query = productRepository.createQueryBuilder("product")
                .leftJoinAndSelect("product.translations", "translations")
                .leftJoinAndSelect("product.group", "group")
                .leftJoinAndSelect("group.translations", "groupTranslations")
                .leftJoinAndSelect("product.catalogs", "catalogs");
            if (hasCatalog) {
                query = query.where("catalogs.id IS NOT NULL");
            }
            const products = await query.getMany();
            return products.map(product => ({
                id: product.id,
                title: product.translations?.[0]?.title || "İsimsiz Ürün",
                description: product.translations?.[0]?.description || "",
                imageUrl: product.imageUrl,
                standard: product.standard,
                groupId: product.group?.id || null,
                groupName: product.group?.translations?.[0]?.name || product.group?.translations?.[0]?.name || "İsimsiz Grup",
                hasCatalog: (product.catalogs && product.catalogs.length > 0),
                catalogCount: product.catalogs?.length || 0,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            }));
        }
        catch (error) {
            throw error;
        }
    }
    // ID ile ürün getir
    async getProductById(id) {
        try {
            const product = await productRepository.findOne({
                where: { id },
                relations: ["translations", "group", "group.translations"]
            });
            if (!product) {
                throw new Error('Product not found');
            }
            return {
                id: product.id,
                slug: product.slug,
                imageUrl: product.imageUrl,
                standard: product.standard,
                groupId: product.group?.id || null,
                groupName: product.group?.translations?.[0]?.name || "İsimsiz Grup",
                translations: product.translations || []
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Slug ile ürün getir
    async getProductBySlug(groupSlug, productSlug, language = 'tr') {
        try {
            const product = await productRepository.findOne({
                where: {
                    slug: productSlug,
                    group: { slug: groupSlug }
                },
                relations: ["translations", "group", "catalogs", "catalogs.translations"]
            });
            if (!product) {
                throw new Error('Product not found');
            }
            const translation = product.translations?.find(t => t.language === language) || product.translations?.[0];
            const catalogs = product.catalogs?.map(catalog => {
                const catalogTranslation = catalog.translations?.find(t => t.language === language);
                return {
                    id: catalog.id,
                    name: catalogTranslation?.name || "Katalog",
                    filePath: catalog.filePath,
                };
            }) || [];
            return {
                id: product.id,
                slug: product.slug,
                groupId: product.group?.id || null,
                groupSlug: product.group?.slug || null,
                title: translation?.title,
                description: translation?.description,
                imageUrl: product.imageUrl,
                standard: product.standard,
                catalogs: catalogs
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Yeni ürün oluştur
    async createProduct(productData, translations, imageFile) {
        try {
            // Resim validasyonu - resim yüklenmemişse hata ver
            if (!imageFile) {
                throw new Error('Ürün resmi zorunludur. Lütfen bir resim yükleyin.');
            }
            // Resim dosyası yüklendiyse URL'yi oluştur
            let finalImageUrl = productData.imageUrl;
            if (imageFile) {
                finalImageUrl = `/uploads/images/Products/${imageFile.filename}`;
                console.log(` Yeni resim URL'si: ${finalImageUrl}`);
            }
            // Üst kategori kontrolü
            const group = await productGroupRepository.findOne({ where: { id: productData.groupId } });
            if (!group) {
                throw new Error('Selected product group not found');
            }
            const product = productRepository.create({
                imageUrl: finalImageUrl,
                standard: productData.standard,
                slug: productData.slug,
                group: group
            });
            const savedProduct = await productRepository.save(product);
            // Çevirileri oluştur ve kaydet
            const translationPromises = translations.map((translation) => {
                const newTranslation = new ProductTranslation_1.ProductTranslation();
                newTranslation.language = translation.language;
                newTranslation.title = translation.title;
                newTranslation.description = translation.description;
                newTranslation.product = savedProduct;
                return productTranslationRepository.save(newTranslation);
            });
            await Promise.all(translationPromises);
            return {
                message: "Product başarıyla oluşturuldu",
                id: savedProduct.id,
                productId: savedProduct.id
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Ürün güncelle
    async updateProduct(id, updateData, translations, imageFile) {
        try {
            const existingProduct = await productRepository.findOne({
                where: { id },
                relations: ["translations", "group"]
            });
            if (!existingProduct) {
                throw new Error('Product not found');
            }
            // Üst kategori kontrolü
            const group = await productGroupRepository.findOne({ where: { id: updateData.groupId } });
            if (!group) {
                throw new Error('Selected product group not found');
            }
            // Resim validasyonu - mevcut resim yoksa ve yeni resim yüklenmemişse hata ver
            if (!existingProduct.imageUrl && !imageFile) {
                throw new Error('Ürün resmi zorunludur. Lütfen bir resim yükleyin.');
            }
            // Yeni resim dosyası yüklendiyse
            let finalImageUrl = updateData.imageUrl;
            if (imageFile) {
                // Eski resmi sil
                if (existingProduct.imageUrl) {
                    const oldImagePath = getPublicFilePath(existingProduct.imageUrl);
                    deleteFileIfExists(oldImagePath);
                    console.log(` Eski resim silindi: ${oldImagePath}`);
                }
                // Yeni resim URL'sini oluştur
                finalImageUrl = `/uploads/images/Products/${imageFile.filename}`;
                console.log(` Yeni resim URL'si: ${finalImageUrl}`);
            }
            // Ürün bilgilerini güncelle
            existingProduct.imageUrl = finalImageUrl;
            existingProduct.standard = updateData.standard;
            existingProduct.slug = updateData.slug;
            existingProduct.group = group;
            existingProduct.updatedAt = new Date();
            // Ürünü kaydet
            const savedProduct = await productRepository.save(existingProduct);
            // Mevcut çevirileri güncelle (sil ve yeniden ekleme yerine)
            for (const translation of translations) {
                // Mevcut çeviriyi bul
                const existingTranslation = existingProduct.translations?.find(t => t.language === translation.language);
                if (existingTranslation) {
                    // Mevcut çeviriyi güncelle (ID korunur)
                    existingTranslation.title = translation.title;
                    existingTranslation.description = translation.description;
                    await productTranslationRepository.save(existingTranslation);
                }
                else {
                    // Yeni dil için çeviri oluştur
                    const newTranslation = new ProductTranslation_1.ProductTranslation();
                    newTranslation.language = translation.language;
                    newTranslation.title = translation.title;
                    newTranslation.description = translation.description;
                    newTranslation.product = savedProduct;
                    await productTranslationRepository.save(newTranslation);
                }
            }
            return {
                message: "Product başarıyla güncellendi",
                productId: savedProduct.id
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Ürün sil
    async deleteProduct(id) {
        try {
            const existingProduct = await productRepository.findOne({
                where: { id },
                relations: ["translations", "catalogs"]
            });
            if (!existingProduct) {
                throw new Error('Product not found');
            }
            // Katalog dosyalarını sil
            if (existingProduct.catalogs && existingProduct.catalogs.length > 0) {
                for (const catalog of existingProduct.catalogs) {
                    if (catalog.filePath) {
                        const catalogFilePath = getPublicFilePath(catalog.filePath);
                        deleteFileIfExists(catalogFilePath);
                    }
                }
                // Katalogları sil (CASCADE ile çevirileri de silinir)
                await catalogRepository.remove(existingProduct.catalogs);
                console.log(" Bağlı kataloglar silindi");
            }
            // Ürün resmini sil
            if (existingProduct.imageUrl) {
                const productImagePath = getPublicFilePath(existingProduct.imageUrl);
                deleteFileIfExists(productImagePath);
            }
            // Ürünü sil (CASCADE ile çeviriler otomatik silinir)
            await productRepository.remove(existingProduct);
            return { message: "Product başarıyla silindi" };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.ProductService = ProductService;
