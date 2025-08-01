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

export const createProductGroupWithFormData = async (req: Request, res: Response) => {
  try {
    console.log("📥 Gelen body:", req.body);

    // req.body kontrolü
    if (!req.body) {
      return res.status(400).json({ message: "Form verileri alınamadı." });
    }

    const { imageUrl, standard } = req.body;

    // 🔒 Güvenli parse
    let translations;
    try {
      if (!req.body.translations) {
        return res.status(400).json({ message: "translations alanı eksik!" });
      }
      translations = JSON.parse(req.body.translations);
    } catch (err) {
      console.error("❌ JSON parse hatası:", err);
      return res.status(400).json({ message: "translations formatı hatalı. JSON.stringify ile gönderilmeli." });
    }

    if (!translations || !Array.isArray(translations) || translations.length !== 4) {
      return res.status(400).json({ message: "4 dilde çeviri zorunludur." });
    }

    const groupRepo = AppDataSource.getRepository(ProductGroup);

    const group = groupRepo.create({ imageUrl, standard });

    group.translations = translations.map((tr: any) => {
      const translation = new ProductGroupTranslation();
      translation.language = tr.language;
      translation.name = tr.name;
      translation.description = tr.description;
      return translation;
    });

    await groupRepo.save(group);

    return res.status(201).json(group);
  } catch (error: any) {
    console.error("❌ Grup eklenemedi:", error);
    return res.status(500).json({ message: "Sunucu hatası", detail: error.message });
  }
};

// ProductGroup güncelleme fonksiyonu
export const updateProductGroup = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    console.log("📝 Güncelleme ID:", groupId);
    console.log("📥 Gelen body:", req.body);

    if (!groupId || isNaN(groupId)) {
      return res.status(400).json({ message: "Geçerli bir ID gerekli" });
    }

    const { imageUrl, standard } = req.body;

    // 🔒 Güvenli parse
    let translations;
    try {
      if (!req.body.translations) {
        return res.status(400).json({ message: "translations alanı eksik!" });
      }
      translations = JSON.parse(req.body.translations);
    } catch (err) {
      console.error("❌ JSON parse hatası:", err);
      return res.status(400).json({ message: "translations formatı hatalı." });
    }

    if (!translations || !Array.isArray(translations) || translations.length !== 4) {
      return res.status(400).json({ message: "4 dilde çeviri zorunludur." });
    }

    const groupRepo = AppDataSource.getRepository(ProductGroup);
    const translationRepo = AppDataSource.getRepository(ProductGroupTranslation);

    // Mevcut grubu bul
    const existingGroup = await groupRepo.findOne({
      where: { id: groupId },
      relations: ["translations"]
    });

    if (!existingGroup) {
      return res.status(404).json({ message: "Grup bulunamadı" });
    }

    // Grup bilgilerini güncelle
    existingGroup.imageUrl = imageUrl;
    existingGroup.standard = standard;

    // Güncellenmiş grubu kaydet
    await groupRepo.save(existingGroup);

    // Eski çevirileri sil
    if (existingGroup.translations && existingGroup.translations.length > 0) {
      await translationRepo.remove(existingGroup.translations);
    }

    // Yeni çevirileri oluştur ve kaydet
    const newTranslations = [];
    for (const tr of translations) {
      const translation = new ProductGroupTranslation();
      translation.language = tr.language;
      translation.name = tr.name;
      translation.description = tr.description;
      translation.group = existingGroup;
      newTranslations.push(translation);
    }
    
    await translationRepo.save(newTranslations);

    // Güncellenmiş grubu ve çevirilerini tekrar çek
    const updatedGroup = await groupRepo.findOne({
      where: { id: groupId },
      relations: ["translations"]
    });

    return res.status(200).json({ message: "Grup başarıyla güncellendi", group: updatedGroup });
  } catch (error: any) {
    console.error("❌ Grup güncellenemedi:", error);
    return res.status(500).json({ message: "Sunucu hatası", detail: error.message });
  }
};

// ProductGroup silme fonksiyonu
export const deleteProductGroup = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    console.log("🗑️ Silinecek grup ID:", groupId);

    if (!groupId || isNaN(groupId)) {
      return res.status(400).json({ message: "Geçerli bir ID gerekli" });
    }

    const groupRepo = AppDataSource.getRepository(ProductGroup);

    // Mevcut grubu bul
    const existingGroup = await groupRepo.findOne({
      where: { id: groupId },
      relations: ["translations", "products"]
    });

    if (!existingGroup) {
      return res.status(404).json({ message: "Grup bulunamadı" });
    }

    // Eğer grupla ilişkili ürünler varsa bunları da sil
    if (existingGroup.products && existingGroup.products.length > 0) {
      console.log(`🗑️ ${existingGroup.products.length} adet bağlı ürün de silinecek`);
      
      const productRepo = AppDataSource.getRepository(Product);
      // Önce bağlı ürünleri sil (CASCADE ile çevirileri de silinir)
      await productRepo.remove(existingGroup.products);
      
      console.log("✅ Bağlı ürünler silindi");
    }

    // Grubu sil (CASCADE ile çeviriler otomatik silinir)
    await groupRepo.remove(existingGroup);

    return res.status(200).json({ message: "Grup başarıyla silindi" });
  } catch (error: any) {
    console.error("❌ Grup silinemedi:", error);
    return res.status(500).json({ message: "Sunucu hatası", detail: error.message });
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

