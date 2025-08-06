import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Catalog } from "../entity/Catalog";
import { Product } from "../entity/Product";
import { CatalogTranslation } from "../entity/CatalogTranslation";
import * as fs from "fs";
import * as path from "path";

// Yardımcı: Dosya sil
const deleteFileIfExists = (filePath: string) => {
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
};
const getPublicFilePath = (relativePath: string) =>
  path.join(__dirname, "../../public", relativePath);

// 1. Bir alt ürünün kataloglarını getir
export const getCatalogsByProduct = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const lang = (req.query.lang as string) || "tr";
  try {
    const catalogs = await AppDataSource.getRepository(Catalog).find({
      where: { product: { id: productId } },
      relations: ["translations"],
    });
    const result = catalogs.map((catalog) => {
      const translation = catalog.translations?.find((t) => t.language === lang);
      return {
        id: catalog.id,
        filePath: catalog.filePath,
        name: translation?.name || "Katalog",
        translations: catalog.translations,
      };
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// 2. Katalog ekle (PDF + çeviri)
export const addCatalogToProduct = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const { translations } = req.body;
  const file = req.file;

  // Validasyon kontrolleri
  if (!file) {
    return res.status(400).json({ message: "PDF dosyası gerekli" });
  }

  // PDF format kontrolü
  if (file.mimetype !== "application/pdf") {
    return res.status(400).json({ 
      message: `Sadece PDF dosyası yüklenebilir. Seçtiğiniz dosya: ${file.originalname} (${file.mimetype})` 
    });
  }

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ message: "Geçerli bir ürün ID'si gerekli" });
  }

  try {
    const product = await AppDataSource.getRepository(Product).findOneBy({ id: productId });
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
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
      return res.status(400).json({ message: "En az bir dilde çeviri gerekli" });
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
      return res.status(400).json({ 
        message: `Aşağıdaki dillerde katalog adı zorunludur: ${missingLangs}` 
      });
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
    return res.status(201).json({ message: "Katalog eklendi" });
  } catch (err) {
    console.error("Katalog ekleme hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// 3. Katalog sil
export const deleteCatalog = async (req: Request, res: Response) => {
  const catalogId = parseInt(req.params.catalogId);
  try {
    const catalog = await AppDataSource.getRepository(Catalog).findOneBy({ id: catalogId });
    if (!catalog) return res.status(404).json({ message: "Katalog bulunamadı" });

    // Dosyayı sil
    if (catalog.filePath) {
      const absPath = getPublicFilePath(catalog.filePath);
      deleteFileIfExists(absPath);
    }

    await AppDataSource.getRepository(Catalog).delete({ id: catalogId });
    return res.json({ message: "Katalog silindi" });
  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// 4. Katalog güncelle (çeviri/dosya)
export const updateCatalog = async (req: Request, res: Response) => {
  const catalogId = parseInt(req.params.catalogId);
  const { translations } = req.body;
  const file = req.file;

  // Validasyon kontrolleri
  if (!catalogId || isNaN(catalogId)) {
    return res.status(400).json({ message: "Geçerli bir katalog ID'si gerekli" });
  }

  // PDF format kontrolü (sadece dosya varsa)
  if (file && file.mimetype !== "application/pdf") {
    return res.status(400).json({ 
      message: `Sadece PDF dosyası yüklenebilir. Seçtiğiniz dosya: ${file.originalname} (${file.mimetype})` 
    });
  }

  try {
    const catalogRepo = AppDataSource.getRepository(Catalog);
    const catalog = await catalogRepo.findOne({
      where: { id: catalogId },
      relations: ["translations"],
    });
    if (!catalog) {
      return res.status(404).json({ message: "Katalog bulunamadı" });
    }

    // Eski dosyayı sil ve yeni dosyayı kaydet (sadece yeni dosya varsa)
    if (file) {
      if (catalog.filePath) {
        const absPath = getPublicFilePath(catalog.filePath);
        deleteFileIfExists(absPath);
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
        return res.status(400).json({ 
          message: `Aşağıdaki dillerde katalog adı zorunludur: ${missingLangs}` 
        });
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
    return res.json({ message: "Katalog güncellendi" });
  } catch (err) {
    console.error("Katalog güncelleme hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
}; 