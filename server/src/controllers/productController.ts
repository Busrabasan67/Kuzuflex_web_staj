import { Request, Response } from "express";
import AppDataSource  from "../data-source";
import { Product } from "../entity/Product";

// 	Belirli bir ürünün detayını çekmek için tasarlanmış fonksiyondur.
export const getSubProduct = async (req: Request, res: Response) => {
  const groupId = parseInt(req.query.group as string);
  const subId = parseInt(req.query.sub as string);

  if (!groupId || !subId) {
    return res.status(400).json({ message: "Eksik parametre" });
  }

  try {
    const productRepo = AppDataSource.getRepository(Product);

    const product = await productRepo.findOne({
      where: {
        id: subId,
        // product.group.id === groupId kontrolü yapılacak:
      },
      relations: ["group", "catalogs", "translations"],
    });

    // Grup kontrolü burada yapılır çünkü TypeORM iç içe where'e izin vermez:
    if (!product || product.group?.id !== groupId) {
      return res.status(404).json({ message: "Alt ürün bulunamadı" });
    }

    const trTranslation = product.translations?.find(t => t.language === "tr");

    return res.json({
      id: product.id,
      title: trTranslation?.title || product.title,
      description: trTranslation?.description || product.description,
      image: product.imageUrl,
      catalog: product.catalogs?.[0]?.fileUrl || "", // İlk PDF dosyasını al
    });
  } catch (err) {
    console.error("Alt ürün API hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};
