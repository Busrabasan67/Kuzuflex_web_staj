import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Product } from "../entity/Product";
import { ProductTranslation } from "../entity/ProductTranslation";
import { ProductGroup } from "../entity/ProductGroup";


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
    groupId: product.group?.id || null,
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

// Tüm ürünleri listeleyen fonksiyon (admin paneli için)
export const getAllProducts = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";

  try {
    const products = await AppDataSource.getRepository(Product)
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.group", "group")
      .leftJoinAndSelect("group.translations", "groupTranslation", "groupTranslation.language = :lang", { lang })
      .leftJoinAndSelect("product.translations", "translation", "translation.language = :lang", { lang })
      .getMany();

    const result = products.map((product) => ({
      id: product.id,
      title: product.translations?.[0]?.title || "Başlık yok",
      description: product.translations?.[0]?.description || "Açıklama yok",
      imageUrl: product.imageUrl,
      standard: product.standard,
      groupId: product.group?.id || null,
      groupName: product.group?.translations?.[0]?.name || "Grup yok",
      // Debug için imageUrl'i de ekleyelim

    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Ürün listesi API hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Alt ürün ekleme fonksiyonu
export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log("📥 Gelen body:", req.body);

    if (!req.body) {
      return res.status(400).json({ message: "Form verileri alınamadı." });
    }

    const { imageUrl, standard, groupId, translations } = req.body;

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
