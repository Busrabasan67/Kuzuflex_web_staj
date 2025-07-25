import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Product } from "../entity/Product";

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
        fileUrl: catalog.fileUrl,
      };
    }) || [];

    return res.json({
      id: product.id,
      groupId: product.group?.id || null,
      title: trTranslation?.title || product.title,
      description: trTranslation?.description || product.description,
      imageUrl: product.imageUrl,
      standard: product.standard,
      catalogs: catalogs,
    });
  } catch (err) {
    console.error("Alt ürün API hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};
