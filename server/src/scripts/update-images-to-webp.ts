// src/scripts/update-images-to-webp.ts
import AppDataSource from "../data-source";
import { Product } from "../entity/Product";
import { ProductGroup } from "../entity/ProductGroup";

const run = async () => {
  await AppDataSource.initialize();

  const productRepo = AppDataSource.getRepository(Product);
  const productGroupRepo = AppDataSource.getRepository(ProductGroup);

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
  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

run(); 