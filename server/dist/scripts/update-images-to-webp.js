"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/update-images-to-webp.ts
const data_source_1 = __importDefault(require("../data-source"));
const Product_1 = require("../entity/Product");
const ProductGroup_1 = require("../entity/ProductGroup");
const run = async () => {
    await data_source_1.default.initialize();
    const productRepo = data_source_1.default.getRepository(Product_1.Product);
    const productGroupRepo = data_source_1.default.getRepository(ProductGroup_1.ProductGroup);
    try {
        console.log("🔄 Resim URL'lerini webp formatına güncelleniyor...");
        // Product tablosundaki imageUrl'leri güncelle
        const products = await productRepo.find();
        for (const product of products) {
            if (product.imageUrl && product.imageUrl.includes('.jpg')) {
                const newImageUrl = product.imageUrl.replace('.jpg', '.webp');
                product.imageUrl = newImageUrl;
                await productRepo.save(product);
                console.log(`✅ Product ${product.id}: ${product.imageUrl} → ${newImageUrl}`);
            }
        }
        // ProductGroup tablosundaki imageUrl'leri güncelle
        const productGroups = await productGroupRepo.find();
        for (const group of productGroups) {
            if (group.imageUrl && group.imageUrl.includes('.jpg')) {
                const newImageUrl = group.imageUrl.replace('.jpg', '.webp');
                group.imageUrl = newImageUrl;
                await productGroupRepo.save(group);
                console.log(`✅ ProductGroup ${group.id}: ${group.imageUrl} → ${newImageUrl}`);
            }
        }
        console.log("✅ Tüm resim URL'leri başarıyla güncellendi!");
    }
    catch (error) {
        console.error("❌ Hata:", error);
    }
    finally {
        await data_source_1.default.destroy();
    }
};
run();
