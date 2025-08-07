import { ProductGroup } from "../entity/ProductGroup";
import { ProductGroupTranslation } from "../entity/ProductGroupTranslation";
import AppDataSource from "../data-source";
import * as fs from "fs";
import * as path from "path";

// Repository'ler
const productGroupRepository = AppDataSource.getRepository(ProductGroup);
const productGroupTranslationRepository = AppDataSource.getRepository(ProductGroupTranslation);

// Yardımcı fonksiyonlar
const deleteFileIfExists = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Dosya silindi: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(` Dosya silinirken hata: ${filePath}`, error);
  }
  return false;
};

const getPublicFilePath = (relativePath: string) => {
  return path.join(process.cwd(), 'public', relativePath);
};

export class ProductGroupService {
  // Tüm üst kategorileri getir (admin paneli için)
  async getAllProductGroupsForAdmin() {
    try {
      const groups = await productGroupRepository.find({
        relations: ["translations", "products"],
        order: { id: "ASC" }
      });

      const result = groups.map((group) => ({
        id: group.id,
        slug: group.slug,
        imageUrl: group.imageUrl,
        standard: group.standard,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        translations: group.translations || [],
        productCount: group.products?.length || 0
      }));

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Tüm üst kategorileri getir (public için)
  async getAllProductGroups(language: string = 'tr') {
    try {
      const groups = await productGroupRepository.find({
        relations: ["translations", "products"],
        order: { id: "ASC" }
      });

      return groups.map(group => ({
        id: group.id,
        slug: group.slug,
        imageUrl: group.imageUrl,
        standard: group.standard,
        translation: group.translations?.find(t => t.language === language) || group.translations?.[0],
        subcategories: group.products || []
      }));
    } catch (error) {
      throw error;
    }
  }

  // Slug ile üst kategori getir
  async getProductGroupBySlug(slug: string, language: string = 'tr') {
    try {
      const group = await productGroupRepository.findOne({
        where: { slug },
        relations: ["translations", "products"]
      });

      if (!group) {
        throw new Error('ProductGroup not found');
      }

      return {
        id: group.id,
        slug: group.slug,
        imageUrl: group.imageUrl,
        standard: group.standard,
        translation: group.translations?.find(t => t.language === language) || group.translations?.[0],
        subcategories: group.products || []
      };
    } catch (error) {
      throw error;
    }
  }

  // ID ile üst kategori getir
  async getProductGroupById(id: number) {
    try {
      const group = await productGroupRepository.findOne({
        where: { id },
        relations: ["translations", "products"]
      });

      if (!group) {
        throw new Error('ProductGroup not found');
      }

      return group;
    } catch (error) {
      throw error;
    }
  }

  // Yeni üst kategori oluştur
  async createProductGroup(marketData: any, translations: any[], imageFile?: Express.Multer.File) {
    try {
      // Resim dosyası yüklendiyse URL'yi oluştur
      let finalImageUrl = marketData.imageUrl;
      if (imageFile) {
        finalImageUrl = `/uploads/images/Products/${imageFile.filename}`;
        console.log(`📸 Yeni resim URL'si: ${finalImageUrl}`);
      }

      const group = productGroupRepository.create({ 
        imageUrl: finalImageUrl, 
        standard: marketData.standard, 
        slug: marketData.slug 
      });

      group.translations = translations.map((tr: any) => {
        const translation = new ProductGroupTranslation();
        translation.language = tr.language;
        translation.name = tr.name;
        translation.description = tr.description;
        return translation;
      });

      const savedGroup = await productGroupRepository.save(group);

      return {
        ...savedGroup,
        imageUrl: finalImageUrl
      };
    } catch (error) {
      throw error;
    }
  }

  // Üst kategori güncelle
  async updateProductGroup(
    id: number, 
    updateData: any, 
    translations: any[], 
    imageFile?: Express.Multer.File
  ) {
    try {
      const existingGroup = await productGroupRepository.findOne({
        where: { id },
        relations: ["translations"]
      });

      if (!existingGroup) {
        throw new Error('ProductGroup not found');
      }

      // Yeni resim dosyası yüklendiyse
      let finalImageUrl = updateData.imageUrl;
      if (imageFile) {
        // Eski resmi sil
        if (existingGroup.imageUrl) {
          const oldImagePath = getPublicFilePath(existingGroup.imageUrl);
          deleteFileIfExists(oldImagePath);
          console.log(`🗑️ Eski resim silindi: ${oldImagePath}`);
        }

        // Yeni resim URL'sini oluştur
        finalImageUrl = `/uploads/images/Products/${imageFile.filename}`;
        console.log(`📸 Yeni resim URL'si: ${finalImageUrl}`);
      }

      // Grup bilgilerini güncelle
      existingGroup.imageUrl = finalImageUrl;
      existingGroup.standard = updateData.standard;
      existingGroup.slug = updateData.slug;
      existingGroup.updatedAt = new Date();

      // Güncellenmiş grubu kaydet
      await productGroupRepository.save(existingGroup);

      // Çevirileri güncelle (sil ve yeniden ekleme yerine update)
      const existingTranslations = await productGroupTranslationRepository.find({ 
        where: { group: { id: existingGroup.id } } 
      });
      
      for (const tr of translations) {
        const existingTranslation = existingTranslations.find(et => et.language === tr.language);
        if (existingTranslation) {
          // Mevcut çeviriyi güncelle
          existingTranslation.name = tr.name;
          existingTranslation.description = tr.description;
          await productGroupTranslationRepository.save(existingTranslation);
        } else {
          // Yeni çeviri ekle
          const newTranslation = new ProductGroupTranslation();
          newTranslation.language = tr.language;
          newTranslation.name = tr.name;
          newTranslation.description = tr.description;
          newTranslation.group = existingGroup;
          await productGroupTranslationRepository.save(newTranslation);
        }
      }

      // Güncellenmiş grubu ve çevirilerini tekrar çek
      const updatedGroup = await productGroupRepository.findOne({
        where: { id },
        relations: ["translations"]
      });

      return {
        ...updatedGroup,
        imageUrl: finalImageUrl
      };
    } catch (error) {
      throw error;
    }
  }

  // Üst kategori sil
  async deleteProductGroup(id: number) {
    try {
      const existingGroup = await productGroupRepository.findOne({
        where: { id },
        relations: ["products", "translations"]
      });

      if (!existingGroup) {
        throw new Error('ProductGroup not found');
      }

      // Bağlı ürünler varsa onları da sil
      if (existingGroup.products && existingGroup.products.length > 0) {
        console.log(`🗑️ ${existingGroup.products.length} adet bağlı ürün de silinecek`);
        
        const productRepo = AppDataSource.getRepository(require("../entity/Product").Product);
        const catalogRepo = AppDataSource.getRepository(require("../entity/Catalog").Catalog);
        
        // Önce bağlı ürünlerin kataloglarını ve dosyalarını sil
        for (const product of existingGroup.products) {
          // Ürünün kataloglarını getir
          const productWithCatalogs = await productRepo.findOne({
            where: { id: product.id },
            relations: ['catalogs']
          });
          
          if (productWithCatalogs && productWithCatalogs.catalogs && productWithCatalogs.catalogs.length > 0) {
            console.log(`🗑️ Ürün ${product.id} için ${productWithCatalogs.catalogs.length} adet katalog silinecek`);
            
            // Katalog dosyalarını sil
            for (const catalog of productWithCatalogs.catalogs) {
              if (catalog.filePath) {
                const catalogFilePath = getPublicFilePath(catalog.filePath);
                deleteFileIfExists(catalogFilePath);
              }
            }
            
            // Katalogları sil (CASCADE ile çevirileri de silinir)
            await catalogRepo.remove(productWithCatalogs.catalogs);
          }
          
          // Ürün resmini sil
          if (product.imageUrl) {
            const productImagePath = getPublicFilePath(product.imageUrl);
            deleteFileIfExists(productImagePath);
          }
        }
        
        // Bağlı ürünleri sil (CASCADE ile çevirileri de silinir)
        await productRepo.remove(existingGroup.products);
        
        console.log("✅ Bağlı ürünler ve katalogları silindi");
      }

      // Grup resmini sil
      if (existingGroup.imageUrl) {
        const groupImagePath = getPublicFilePath(existingGroup.imageUrl);
        deleteFileIfExists(groupImagePath);
      }

      // Grubu sil (CASCADE ile çeviriler otomatik silinir)
      await productGroupRepository.remove(existingGroup);

      return { message: "ProductGroup başarıyla silindi" };
    } catch (error) {
      throw error;
    }
  }
}
