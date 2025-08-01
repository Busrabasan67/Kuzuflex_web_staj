// Fix product imageUrl paths
import AppDataSource from "../data-source";
import { Product } from "../entity/Product";

const run = async () => {
  await AppDataSource.initialize();

  const productRepo = AppDataSource.getRepository(Product);

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
  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

run();