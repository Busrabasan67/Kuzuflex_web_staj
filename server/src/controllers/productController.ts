import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Product } from "../entity/Product";
import { ProductTranslation } from "../entity/ProductTranslation";
import { ProductGroup } from "../entity/ProductGroup";
import { Catalog } from "../entity/Catalog";
import * as fs from "fs";
import * as path from "path";

// Dosya silme yardımcı fonksiyonu
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

// Dosya yolu oluşturma yardımcı fonksiyonu
const getPublicFilePath = (relativePath: string) => {
  // __dirname: server/src/controllers
  // İhtiyacımız: server/public
  return path.join(__dirname, "../../public", relativePath);
};

// Belirli bir ürünün detayını çekmek için tasarlanmış fonksiyondur.
export const getSubProduct = async (req: Request, res: Response) => {
  const groupId = parseInt(req.query.group as string);
  const subId = parseInt(req.query.sub as string);

  if (!groupId || !subId) {
    return res.status(400).json({ message: "Eksik parametre" });
  }

  try {
    const productRepo = AppDataSource.getRepository(Product);

    const product = await productRepo.findOne({
      where: { id: subId },
      relations: [
        "group",
        "translations",
        "catalogs",
        "catalogs.translations",
      ],
    });

    if (!product || product.group?.id !== groupId) {
      return res.status(404).json({ message: "Alt ürün bulunamadı" });
    }

    const lang = (req.query.lang as string) || "tr";
    const trTranslation = product.translations?.find((t) => t.language === lang);

    const catalogs = product.catalogs?.map((catalog) => {
      const translation = catalog.translations?.find((t) => t.language === lang);
      return {
        id: catalog.id,
        name: translation?.name || "Katalog",
        filePath: catalog.filePath,
      };
    }) || [];

  
   return res.json({
    id: product.id,
    slug: product.slug,
    groupId: product.group?.id || null,
    groupSlug: product.group?.slug || null,
    title: trTranslation?.title,
    description: trTranslation?.description,
    imageUrl: product.imageUrl,
    standard: product.standard,
    catalogs: catalogs, // varsa kataloglar
  });
  } catch (err) {
    console.error("Alt ürün API hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Slug bazlı ürün getirme (yeni sistem)
export const getProductBySlug = async (req: Request, res: Response) => {
  const { groupSlug, productSlug } = req.params;
  const lang = (req.query.lang as string) || "tr";

  try {
    const productRepo = AppDataSource.getRepository(Product);

    const product = await productRepo.findOne({
      where: { 
        slug: productSlug,
        group: { slug: groupSlug }
      },
      relations: [
        "group",
        "translations",
        "catalogs",
        "catalogs.translations",
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    const trTranslation = product.translations?.find((t) => t.language === lang);

    const catalogs = product.catalogs?.map((catalog) => {
      const translation = catalog.translations?.find((t) => t.language === lang);
      return {
        id: catalog.id,
        name: translation?.name || "Katalog",
        filePath: catalog.filePath,
      };
    }) || [];

    return res.json({
      id: product.id,
      slug: product.slug,
      groupId: product.group?.id || null,
      groupSlug: product.group?.slug || null,
      title: trTranslation?.title,
      description: trTranslation?.description,
      imageUrl: product.imageUrl,
      standard: product.standard,
      catalogs: catalogs,
    });
  } catch (err) {
    console.error("Slug bazlı ürün API hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Tüm ürünleri listeleyen fonksiyon (admin paneli için)
export const getAllProducts = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";
  const hasCatalog = req.query.hasCatalog === "true"; // Katalogu olan ürünleri filtrele

  try {
    let query = AppDataSource.getRepository(Product)
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.group", "group")
      .leftJoinAndSelect("group.translations", "groupTranslation", "groupTranslation.language = :lang", { lang })
      .leftJoinAndSelect("product.translations", "translation", "translation.language = :lang", { lang })
      .leftJoinAndSelect("product.catalogs", "catalog"); // Her zaman katalog bilgilerini al

    const products = await query.getMany();

    const result = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.translations?.[0]?.title || "Başlık yok",
      description: product.translations?.[0]?.description || "Açıklama yok",
      imageUrl: product.imageUrl,
      standard: product.standard,
      groupId: product.group?.id || null,
      groupSlug: product.group?.slug || null,
      groupName: product.group?.translations?.[0]?.name || "Grup yok",
      hasCatalog: product.catalogs && product.catalogs.length > 0,
      catalogCount: product.catalogs?.length || 0,
    }));

    // Eğer sadece katalogu olan ürünler isteniyorsa filtrele
    const filteredResult = hasCatalog 
      ? result.filter(product => product.hasCatalog)
      : result;

    return res.status(200).json(filteredResult);
  } catch (err) {
    console.error("Ürün listesi API hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Tek alt ürün getiren fonksiyon (düzenleme için admin paneli için)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({
      where: { id: productId },
      relations: ['translations', 'group', 'group.translations']
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    const result = {
      id: product.id,
      slug: product.slug, // SEO dostu URL slug'ı
      imageUrl: product.imageUrl,
      standard: product.standard,
      groupId: product.group?.id || null,
      groupName: product.group?.translations?.[0]?.name || "Grup yok",
      translations: product.translations?.map(t => ({
        language: t.language,
        title: t.title,
        description: t.description
      })) || []
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Ürün getirme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Alt ürün güncelleme fonksiyonu
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    console.log("📥 Gelen güncelleme verisi:", req.body, "ID:", productId);

    if (!req.body) {
      return res.status(400).json({ message: "Form verileri alınamadı." });
    }

    const { imageUrl, standard, groupId, translations, slug } = req.body;

    // 🔒 Güvenli parse
    let parsedTranslations;
    try {
      parsedTranslations = typeof translations === 'string' ? JSON.parse(translations) : translations;
    } catch (error) {
      console.error("❌ Translations parse hatası:", error);
      return res.status(400).json({ message: "Çeviri verileri hatalı format." });
    }

    // Validasyon
    if (!parsedTranslations || !Array.isArray(parsedTranslations)) {
      return res.status(400).json({ message: "Çeviri verileri eksik veya hatalı." });
    }

    if (!groupId) {
      return res.status(400).json({ message: "Üst kategori seçimi zorunludur." });
    }

    // Mevcut ürünü bul
    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ 
      where: { id: productId },
      relations: ['translations', 'group']
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    // Üst kategori kontrolü
    const productGroupRepo = AppDataSource.getRepository(ProductGroup);
    const group = await productGroupRepo.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(400).json({ message: "Seçilen üst kategori bulunamadı." });
    }

    // Eski resmi sil (eğer yeni resim yüklendiyse)
    if (product.imageUrl && product.imageUrl !== imageUrl) {
      const oldImagePath = getPublicFilePath(product.imageUrl);
      deleteFileIfExists(oldImagePath);
    }

    // Ürün bilgilerini güncelle
    product.imageUrl = imageUrl || product.imageUrl; // Resim değişmediyse eskisini kullan
    product.standard = standard || null;
    product.slug = slug;
    product.group = group;

    // Ürünü kaydet
    const savedProduct = await productRepo.save(product);

    // Mevcut çevirileri sil
    const translationRepo = AppDataSource.getRepository(ProductTranslation);
    await translationRepo.delete({ product: { id: productId } });

    // Yeni çevirileri oluştur ve kaydet
    const translationPromises = parsedTranslations.map((translation: any) => {
      const newTranslation = new ProductTranslation();
      newTranslation.language = translation.language;
      newTranslation.title = translation.title;
      newTranslation.description = translation.description;
      newTranslation.product = savedProduct;
      return translationRepo.save(newTranslation);
    });

    await Promise.all(translationPromises);

    console.log("✅ Alt ürün başarıyla güncellendi:", savedProduct.id);
    return res.status(200).json({
      message: "Alt ürün başarıyla güncellendi.",
      productId: savedProduct.id
    });

  } catch (error) {
    console.error("❌ Alt ürün güncelleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Alt ürün silme fonksiyonu
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({
      where: { id: productId },
      relations: ['translations', 'catalogs']
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    // Katalogları ve dosyalarını sil
    if (product.catalogs && product.catalogs.length > 0) {
      console.log(`🗑️ ${product.catalogs.length} adet katalog silinecek`);
      
      for (const catalog of product.catalogs) {
        if (catalog.filePath) {
          const catalogFilePath = getPublicFilePath(catalog.filePath);
          deleteFileIfExists(catalogFilePath);
        }
      }
      
      // Katalogları sil (CASCADE ile çevirileri de silinir)
      const catalogRepo = AppDataSource.getRepository(Catalog);
      await catalogRepo.remove(product.catalogs);
      
      console.log("✅ Kataloglar silindi");
    }

    // Ürün resmini sil
    if (product.imageUrl) {
      const productImagePath = getPublicFilePath(product.imageUrl);
      deleteFileIfExists(productImagePath);
    }

    // Ürünü sil (CASCADE olduğu için çeviriler de silinir)
    await productRepo.remove(product);

    console.log("✅ Alt ürün başarıyla silindi:", productId);
    return res.status(200).json({
      message: "Alt ürün başarıyla silindi."
    });

  } catch (error) {
    console.error("❌ Alt ürün silme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Alt ürün ekleme fonksiyonu
export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log("📥 Gelen body:", req.body);

    if (!req.body) {
      return res.status(400).json({ message: "Form verileri alınamadı." });
    }

    const { imageUrl, standard, groupId, translations, slug } = req.body;

    // 🔒 Güvenli parse
    let parsedTranslations;
    try {
      parsedTranslations = typeof translations === 'string' ? JSON.parse(translations) : translations;
    } catch (error) {
      console.error("❌ Translations parse hatası:", error);
      return res.status(400).json({ message: "Çeviri verileri hatalı format." });
    }

    // Validasyon
    if (!parsedTranslations || !Array.isArray(parsedTranslations)) {
      return res.status(400).json({ message: "Çeviri verileri eksik veya hatalı." });
    }

    if (!groupId) {
      return res.status(400).json({ message: "Üst kategori seçimi zorunludur." });
    }

    // Üst kategori kontrolü
    const productGroupRepo = AppDataSource.getRepository(ProductGroup);
    const group = await productGroupRepo.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(400).json({ message: "Seçilen üst kategori bulunamadı." });
    }

    // Yeni ürün oluştur
    const productRepo = AppDataSource.getRepository(Product);
    const newProduct = new Product();
    newProduct.imageUrl = imageUrl || null;
    newProduct.standard = standard || null;
    newProduct.slug = slug;
    newProduct.group = group;

    // Ürünü kaydet
    const savedProduct = await productRepo.save(newProduct);

    // Çevirileri oluştur ve kaydet
    const translationRepo = AppDataSource.getRepository(ProductTranslation);
    const translationPromises = parsedTranslations.map((translation: any) => {
      const newTranslation = new ProductTranslation();
      newTranslation.language = translation.language;
      newTranslation.title = translation.title;
      newTranslation.description = translation.description;
      newTranslation.product = savedProduct;
      return translationRepo.save(newTranslation);
    });

    await Promise.all(translationPromises);

    console.log("✅ Alt ürün başarıyla eklendi:", savedProduct.id);
    return res.status(201).json({
      message: "Alt ürün başarıyla eklendi.",
      productId: savedProduct.id
    });

  } catch (error) {
    console.error("❌ Alt ürün ekleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};
