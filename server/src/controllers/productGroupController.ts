// src/controllers/productGroupController.ts
import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { ProductGroup } from "../entity/ProductGroup";
import { Product } from "../entity/Product";



// fonksiyonu projende navbar menüsünü beslemek için tasarlanmış ana fonksiyondur. 
export const getAllGroups = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";

  try {
    const groups = await AppDataSource.getRepository(ProductGroup)
  .createQueryBuilder("group")
  .leftJoinAndSelect("group.translations", "groupTranslation", "groupTranslation.language = :lang", { lang })
  .leftJoinAndSelect("group.products", "product")
  .leftJoinAndSelect("product.translations", "productTranslation", "productTranslation.language = :lang", { lang })
  .getMany();


    const result = groups.map((group) => ({
      id: group.id,
      name: group.translations?.[0]?.name || group.name,
      key: `group-${group.id}`,
      subcategories: (group.products || []).map((product) => {
        const translation = product.translations?.find(t => t.language === lang);
        return {
          id: product.id,
          title: translation?.title,
          description: translation?.description,
          imageUrl: product.imageUrl || null,
          standard: product.standard || null,
          key: `sub-${group.id}-${product.id}`,
        };
      }),
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Grup verileri alınamadı:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

/*
// 	 Belirli Grup altındaki tüm ürünleri çekmek için tasarlanmış fonksiyondur.
export const getProductsByGroupId = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";
  const groupId = parseInt(req.params.groupId);

  try {
    const products = await AppDataSource.getRepository(Product)
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.translations", "translation", "translation.language = :lang", { lang })
      .where("product.groupId = :groupId", { groupId })
      .getMany();

    const result = products.map((product) => ({
      id: product.id,
      title: product.translations?.[0]?.title || product.title,
      description: product.translations?.[0]?.description || product.description,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Ürünler alınamadı:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};
*/

export const getProductsByGroupId = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";
  const groupId = parseInt(req.params.groupId);

  const products = await AppDataSource.getRepository(Product)
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.translations", "translation", "translation.language = :lang", { lang })
    .where("product.groupId = :groupId", { groupId })
    .getMany();

  const result = products.map((product) => ({
    id: product.id,
    title: product.translations?.[0]?.title,
    description: product.translations?.[0]?.description,
    imageUrl: product.imageUrl,
    standard: product.standard,
    key: `sub-${groupId}-${product.id}`,
  }));

  return res.status(200).json(result);
};

