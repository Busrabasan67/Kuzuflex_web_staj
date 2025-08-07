import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Product } from "../entity/Product";
import { ProductTranslation } from "../entity/ProductTranslation";
import { ProductGroup } from "../entity/ProductGroup";
import { Catalog } from "../entity/Catalog";
import { ProductService } from "../services/productService";

const productService = new ProductService();



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
  const hasCatalog = req.query.hasCatalog === "true";

  try {
    const result = await productService.getAllProductsForAdmin(hasCatalog);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Ürün listesi alınamadı:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Tek alt ürün getiren fonksiyon (düzenleme için admin paneli için)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await productService.getProductById(productId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Ürün getirme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Alt ürün güncelleme fonksiyonu (resim dahil)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    console.log("📥 Gelen güncelleme verisi:", req.body, "ID:", productId);
    console.log("📁 Dosya var mı:", !!req.file);

    if (!req.body) {
      return res.status(400).json({ message: "Form verileri alınamadı." });
    }

    // FormData'dan gelen verileri al
    const updateData = {
      imageUrl: req.body.imageUrl || '',
      standard: req.body.standard || null,
      groupId: parseInt(req.body.groupId),
      slug: req.body.slug
    };

    // 🔒 Güvenli parse
    let parsedTranslations;
    try {
      parsedTranslations = typeof req.body.translations === 'string' ? JSON.parse(req.body.translations) : req.body.translations;
    } catch (error) {
      console.error("❌ Translations parse hatası:", error);
      return res.status(400).json({ message: "Çeviri verileri hatalı format." });
    }

    // Validasyon
    if (!parsedTranslations || !Array.isArray(parsedTranslations)) {
      return res.status(400).json({ message: "Çeviri verileri eksik veya hatalı." });
    }

    if (!updateData.groupId) {
      return res.status(400).json({ message: "Üst kategori seçimi zorunludur." });
    }

    const result = await productService.updateProduct(productId, updateData, parsedTranslations, req.file);
    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ Alt ürün güncelleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Alt ürün silme fonksiyonu
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await productService.deleteProduct(productId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Alt ürün silme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Alt ürün ekleme fonksiyonu (resim dahil)
export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log("📥 Gelen body:", req.body);
    console.log("📁 Dosya var mı:", !!req.file);

    if (!req.body) {
      return res.status(400).json({ message: "Form verileri alınamadı." });
    }

    // FormData'dan gelen verileri al
    const productData = {
      imageUrl: req.body.imageUrl || '',
      standard: req.body.standard || null,
      groupId: parseInt(req.body.groupId),
      slug: req.body.slug
    };

    // 🔒 Güvenli parse
    let parsedTranslations;
    try {
      parsedTranslations = typeof req.body.translations === 'string' ? JSON.parse(req.body.translations) : req.body.translations;
    } catch (error) {
      console.error("❌ Translations parse hatası:", error);
      return res.status(400).json({ message: "Çeviri verileri hatalı format." });
    }

    // Validasyon
    if (!parsedTranslations || !Array.isArray(parsedTranslations)) {
      return res.status(400).json({ message: "Çeviri verileri eksik veya hatalı." });
    }

    if (!productData.groupId) {
      return res.status(400).json({ message: "Üst kategori seçimi zorunludur." });
    }

    const result = await productService.createProduct(productData, parsedTranslations, req.file);
    return res.status(201).json(result);

  } catch (error) {
    console.error("❌ Alt ürün ekleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};


