// src/controllers/productGroupController.ts
import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { ProductGroup } from "../entity/ProductGroup";
import { Product } from "../entity/Product";
import { ProductGroupTranslation } from "../entity/ProductGroupTranslation";



// fonksiyonu projende navbar menüsünü beslemek için tasarlanmış ana fonksiyondur. 
export const getAllGroups = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";

  try {
    // Veritabanından ilgili dilde çevirisiyle birlikte grupları al
    const groups = await AppDataSource.getRepository(ProductGroup)
      .createQueryBuilder("group")
      .leftJoinAndSelect("group.translations", "groupTranslation", "groupTranslation.language = :lang", { lang })
      .leftJoinAndSelect("group.products", "product")
      .leftJoinAndSelect("product.translations", "productTranslation", "productTranslation.language = :lang", { lang })
      .getMany();

    // Her grup için, ortak alanlar ve ilgili dilde çeviri döndür
    const result = groups.map((group) => ({
      id: group.id, // Grup ID'si
      imageUrl: group.imageUrl || null, // Grup görseli
      standard: group.standard || null, // Grup standardı
      // Sadece ilgili dildeki çeviri
      translation: group.translations?.[0]
        ? {
            language: group.translations[0].language,
            name: group.translations[0].name,
            description: group.translations[0].description,
          }
        : null,
      // Alt ürünler (subcategories)
      subcategories: (group.products || []).map((product) => {
        const translation = product.translations?.find(t => t.language === lang);
        return {
          id: product.id, // Ürün ID'si
          title: translation?.title, // Ürün adı (çeviri)
          description: translation?.description, // Ürün açıklaması (çeviri)
          imageUrl: product.imageUrl || null, // Ürün görseli
          standard: product.standard || null, // Ürün standardı
          key: `sub-${group.id}-${product.id}` // Anahtar
        };
      }),
    }));

    // Sonucu JSON olarak döndür
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Grup verileri alınamadı:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};


export const getProductsByGroupId = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";
  const groupId = parseInt(req.params.groupId);

  const products = await AppDataSource.getRepository(Product)
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.translations", "translation", "translation.language = :lang", { lang })
    .leftJoinAndSelect("product.catalogs", "catalog")
    .leftJoinAndSelect("catalog.translations", "catalogTranslation", "catalogTranslation.language = :lang", { lang })
    .where("product.groupId = :groupId", { groupId })
    .getMany();

  const result = products.map((product) => ({
    id: product.id,
    title: product.translations?.[0]?.title,
    description: product.translations?.[0]?.description,
    imageUrl: product.imageUrl,
    standard: product.standard,
    catalogs: (product.catalogs || []).map((catalog) => ({
      id: catalog.id,
      name: catalog.translations?.[0]?.name || "Katalog",
      filePath: catalog.filePath,
    })),
    key: `sub-${groupId}-${product.id}`,
  }));

  return res.status(200).json(result);
};


  /*
 
   // Yeni bir üst ürün kategorisi (ProductGroup) ve ona ait çevirileri ekleyen fonksiyon
   export const createProductGroup = async (req: Request, res: Response) => {
    try {
      // İstekten ortak alanları (imageUrl, standard) ve çevirileri (translations) al
      const { imageUrl, standard, translations } = req.body;

      // Çeviri dizisi yoksa veya 4 dilde değilse hata döndür
      if (!translations || !Array.isArray(translations) || translations.length !== 4) {
        return res.status(400).json({ message: "4 dilde çeviri zorunludur." });
      }

      // ProductGroup repository'sini al
      const groupRepo = AppDataSource.getRepository(ProductGroup);

      // Yeni bir ProductGroup nesnesi oluştur ve ortak alanları ata
      const group = groupRepo.create({ imageUrl, standard });

      // Her bir çeviri için ProductGroupTranslation nesnesi oluştur
      group.translations = translations.map((tr: any) => {
        // Yeni çeviri nesnesi oluştur
        const translation = new ProductGroupTranslation();
        // Dil kodunu ata (ör: 'tr', 'en', 'fr', 'de')
        translation.language = tr.language;
        // Başlığı ata
        translation.name = tr.name;
        // Açıklamayı ata
        translation.description = tr.description;
        // Çeviri nesnesini döndür
        return translation;
      });

      // ProductGroup'u ve çevirilerini veritabanına kaydet
      await groupRepo.save(group);

      // Başarıyla eklenen grubu JSON olarak döndür
      return res.status(201).json(group);
    } catch (error) {
      // Hata olursa logla ve hata mesajı döndür
      console.error("Grup eklenemedi:", error);
      return res.status(500).json({ message: "Sunucu hatası" });
    }
  };

  */

  // FormData ile hem dosya hem diğer alanları alan yeni fonksiyon
export const createProductGroupWithFormData = async (req: Request, res: Response) => {
  try {
    // Yüklenen dosyanın yolunu al (public/ öneki olmadan)
    const imageUrl = req.file ? `uploads/images/Products/${req.file.filename}` : "";

    // Diğer alanları al
    const { standard } = req.body;
    // translations alanı JSON string olarak gelir, parse et
    const translations = JSON.parse(req.body.translations);

    // Çeviri sayısı kontrolü
    if (!translations || !Array.isArray(translations) || translations.length !== 4) {
      return res.status(400).json({ message: "4 dilde çeviri zorunludur." });
    }

    // ProductGroup repository'sini al
    const groupRepo = AppDataSource.getRepository(ProductGroup);

    // Yeni bir ProductGroup nesnesi oluştur ve ortak alanları ata
    const group = groupRepo.create({ imageUrl, standard });

    // Her bir çeviri için ProductGroupTranslation nesnesi oluştur
    group.translations = translations.map((tr: any) => {
      const translation = new ProductGroupTranslation();
      translation.language = tr.language;
      translation.name = tr.name;
      translation.description = tr.description;
      return translation;
    });

    // ProductGroup'u ve çevirilerini veritabanına kaydet
    await groupRepo.save(group);

    // Başarıyla eklenen grubu JSON olarak döndür
    return res.status(201).json(group);
  } catch (error) {
    console.error("Grup eklenemedi:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};
// Admin paneli için üst kategorileri listeleme fonksiyonu
export const getAdminProductGroups = async (req: Request, res: Response) => {
  try {
    const groupRepo = AppDataSource.getRepository(ProductGroup); // Veritabanındaki ProductGroup tablosuna erişir
    // Veritabanındaki ProductGroup tablosundaki tüm grupları çevirileri ile birlikte alır
    const groups = await groupRepo.find({
      relations: ["translations", "products"], // Çok dilli çeviri ve ürünleri ile birlikte alır
      order: { id: "ASC" } // id'ye göre artan sırada sıralar
    });
    // Verileri frontend'e uygun formatta döndür
    const result = groups.map((group) => ({
      id: group.id, // Grup ID'si
      imageUrl: group.imageUrl, // Grup görseli
      standard: group.standard, // Grup standardı
      translations: group.translations || [], // Çeviri dizisi
      productCount: group.products?.length || 0 // Alt ürün sayısı
    }));
    // Sonucu JSON olarak döndür
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Admin grup listesi alınamadı:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

