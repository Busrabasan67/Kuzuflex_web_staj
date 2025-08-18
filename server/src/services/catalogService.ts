import AppDataSource from "../data-source";
import { Catalog } from "../entity/Catalog";
import { Product } from "../entity/Product";
import { CatalogTranslation } from "../entity/CatalogTranslation";
import * as fs from "fs";
import * as path from "path";

export class CatalogService {
  // Yardımcı: Dosya sil
  private deleteFileIfExists(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Dosya silindi: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Dosya silinirken hata: ${filePath}`, error);
      return false;
    }
  }

  private getPublicFilePath(relativePath: string): string {
    return path.join(__dirname, "../../public", relativePath);
  }

  // 1. Bir alt ürünün kataloglarını getir
  async getCatalogsByProduct(productId: number, language: string) {
    try {
      const catalogs = await AppDataSource.getRepository(Catalog).find({
        where: { product: { id: productId } },
        relations: ["translations"],
      });

      const result = catalogs.map((catalog) => {
        const translation = catalog.translations?.find((t) => t.language === language);
        return {
          id: catalog.id,
          filePath: catalog.filePath,
          name: translation?.name || "Katalog",
          translations: catalog.translations,
        };
      });

      return result;
    } catch (error) {
      console.error("Katalog getirme hatası:", error);
      throw new Error("Kataloglar alınamadı");
    }
  }

  // 2. Katalog ekle (PDF + çeviri)
  async addCatalogToProduct(productId: number, translations: any, file?: Express.Multer.File) {
    try {
      // Validasyon kontrolleri
      if (!file) {
        throw new Error("PDF dosyası gerekli");
      }

      // PDF format kontrolü
      if (file.mimetype !== "application/pdf") {
        throw new Error(`Sadece PDF dosyası yüklenebilir. Seçtiğiniz dosya: ${file.originalname} (${file.mimetype})`);
      }

      if (!productId || isNaN(productId)) {
        throw new Error("Geçerli bir ürün ID'si gerekli");
      }

      const product = await AppDataSource.getRepository(Product).findOneBy({ id: productId });
      if (!product) {
        throw new Error("Ürün bulunamadı");
      }

      // translations: JSON string veya array olabilir
      let parsedTranslations;
      try {
        parsedTranslations = typeof translations === "string" ? JSON.parse(translations) : translations;
      } catch {
        parsedTranslations = [];
      }

      // Çeviri validasyonu
      if (!Array.isArray(parsedTranslations) || parsedTranslations.length === 0) {
        throw new Error("En az bir dilde çeviri gerekli");
      }

      // TÜM DİLLER ZORUNLU
      const requiredLanguages = ['tr', 'en', 'de', 'fr'];
      const missingLanguages = requiredLanguages.filter(lang => 
        !parsedTranslations.some((t: any) => 
          t && t.language === lang && t.name && t.name.trim() !== ''
        )
      );
      
      if (missingLanguages.length > 0) {
        const missingLangs = missingLanguages.map(lang => lang.toUpperCase()).join(', ');
        throw new Error(`Aşağıdaki dillerde katalog adı zorunludur: ${missingLangs}`);
      }

      const catalog = new Catalog();
      catalog.filePath = `uploads/catalogs/${file.filename}`;
      catalog.product = product;
      catalog.translations = [];

      // Geçerli çevirileri ekle
      catalog.translations = parsedTranslations
        .filter((t: any) => t && t.language && t.name && t.name.trim() !== '')
        .map((t: any) => {
          const tr = new CatalogTranslation();
          tr.language = t.language;
          tr.name = t.name.trim();
          tr.catalog = catalog;
          return tr;
        });

      await AppDataSource.getRepository(Catalog).save(catalog);
      return { message: "Katalog eklendi" };
    } catch (error) {
      console.error("Katalog ekleme hatası:", error);
      throw error;
    }
  }

  // 3. Katalog sil
  async deleteCatalog(catalogId: number) {
    try {
      const catalog = await AppDataSource.getRepository(Catalog).findOneBy({ id: catalogId });
      if (!catalog) {
        throw new Error("Katalog bulunamadı");
      }

      // Dosyayı sil
      if (catalog.filePath) {
        const absPath = this.getPublicFilePath(catalog.filePath);
        this.deleteFileIfExists(absPath);
      }

      await AppDataSource.getRepository(Catalog).delete({ id: catalogId });
      return { message: "Katalog silindi" };
    } catch (error) {
      console.error("Katalog silme hatası:", error);
      throw error;
    }
  }

  // 4. Katalog güncelle (çeviri/dosya)
  async updateCatalog(catalogId: number, translations: any, file?: Express.Multer.File) {
    try {
      // Validasyon kontrolleri
      if (!catalogId || isNaN(catalogId)) {
        throw new Error("Geçerli bir katalog ID'si gerekli");
      }

      // PDF format kontrolü (sadece dosya varsa)
      if (file && file.mimetype !== "application/pdf") {
        throw new Error(`Sadece PDF dosyası yüklenebilir. Seçtiğiniz dosya: ${file.originalname} (${file.mimetype})`);
      }

      const catalogRepo = AppDataSource.getRepository(Catalog);
      const catalog = await catalogRepo.findOne({
        where: { id: catalogId },
        relations: ["translations"],
      });

      if (!catalog) {
        throw new Error("Katalog bulunamadı");
      }

      // Eski dosyayı sil ve yeni dosyayı kaydet (sadece yeni dosya varsa)
      if (file) {
        if (catalog.filePath) {
          const absPath = this.getPublicFilePath(catalog.filePath);
          this.deleteFileIfExists(absPath);
        }
        catalog.filePath = `uploads/catalogs/${file.filename}`;
      }

      // Çevirileri güncelle
      let parsedTranslations;
      try {
        parsedTranslations = typeof translations === "string" ? JSON.parse(translations) : translations;
      } catch {
        parsedTranslations = [];
      }

      // Çeviri validasyonu
      if (Array.isArray(parsedTranslations) && parsedTranslations.length > 0) {
        // TÜM DİLLER ZORUNLU
        const requiredLanguages = ['tr', 'en', 'de', 'fr'];
        const missingLanguages = requiredLanguages.filter(lang => 
          !parsedTranslations.some((t: any) => 
            t && t.language === lang && t.name && t.name.trim() !== ''
          )
        );
        
        if (missingLanguages.length > 0) {
          const missingLangs = missingLanguages.map(lang => lang.toUpperCase()).join(', ');
          throw new Error(`Aşağıdaki dillerde katalog adı zorunludur: ${missingLangs}`);
        }

        // Mevcut çevirileri güncelle veya yeni ekle
        for (const translationData of parsedTranslations) {
          if (!translationData.language || !translationData.name || translationData.name.trim() === '') {
            continue; // Geçersiz çevirileri atla
          }

          const existingTranslation = catalog.translations?.find(
            (t) => t.language === translationData.language
          );
          
          if (existingTranslation) {
            // Mevcut çeviriyi güncelle
            existingTranslation.name = translationData.name.trim();
          } else {
            // Yeni çeviri ekle
            const newTranslation = new CatalogTranslation();
            newTranslation.language = translationData.language;
            newTranslation.name = translationData.name.trim();
            newTranslation.catalog = catalog;
            catalog.translations.push(newTranslation);
          }
        }
      }

      await catalogRepo.save(catalog);
      return { message: "Katalog güncellendi" };
    } catch (error) {
      console.error("Katalog güncelleme hatası:", error);
      throw error;
    }
  }
}

export default new CatalogService();
