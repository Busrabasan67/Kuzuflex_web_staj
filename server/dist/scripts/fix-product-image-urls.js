"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Fix product imageUrl paths
const data_source_1 = __importDefault(require("../data-source"));
const Product_1 = require("../entity/Product");
const run = async () => {
    await data_source_1.default.initialize();
    const productRepo = data_source_1.default.getRepository(Product_1.Product);
    try {
        console.log("🔄 Alt ürün resim URL'lerini düzeltiliyor...");
        const products = await productRepo.find();
        for (const product of products) {
            if (product.imageUrl && !product.imageUrl.startsWith('uploads/')) {
                // Sadece dosya adı varsa, tam yolu ekle
                const newImageUrl = `uploads/images/Products/${product.imageUrl}`;
                product.imageUrl = newImageUrl;
                await productRepo.save(product);
                console.log(`✅ Product ${product.id}: ${product.imageUrl} güncellendi`);
            }
        }
        console.log("✅ Tüm alt ürün resim URL'leri başarıyla düzeltildi!");
    }
    catch (error) {
        console.error("❌ Hata:", error);
    }
    finally {
        await data_source_1.default.destroy();
    }
};
run();
