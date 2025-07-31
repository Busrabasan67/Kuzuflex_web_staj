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
    const groups = await AppDataSource.getRepository(ProductGroup)
  .createQueryBuilder("group")
  .leftJoinAndSelect("group.translations", "groupTranslation", "groupTranslation.language = :lang", { lang })
  .leftJoinAndSelect("group.products", "product")
  .leftJoinAndSelect("product.translations", "productTranslation", "productTranslation.language = :lang", { lang })
  .getMany();


    const result = groups.map((group) => ({
      id: group.id,
      name: group.translations?.[0]?.name || group.name,
      description: group.translations?.[0]?.description || group.description,
      imageUrl: group.imageUrl || null,
      standard: group.standard || null,
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


  export const createProductGroup = async (req: Request, res: Response) => {
    try {
      const { name, description, imageUrl, standard, translations } = req.body;
  
      // Ana grup oluştur
      const groupRepo = AppDataSource.getRepository(ProductGroup);
      const group = groupRepo.create({ name, description, imageUrl, standard });
  
      // Çevirileri ekle
      if (translations && Array.isArray(translations)) {
        group.translations = translations.map((tr: any) =>
          Object.assign(new ProductGroupTranslation(), tr)
        );
      }
  
      await groupRepo.save(group);
  
      return res.status(201).json(group);
    } catch (error) {
      console.error("Grup eklenemedi:", error);
      return res.status(500).json({ message: "Sunucu hatası" });
    }
  };

// Admin paneli için üst kategorileri listeleme fonksiyonu
export const getAdminProductGroups = async (req: Request, res: Response) => {
  try {
    const groupRepo = AppDataSource.getRepository(ProductGroup); //veritabanındaki ProductGroup tablosuna erişir.
    
    // veritabanındaki ProductGroup tablosundaki tüm grupları çevirileri ile birlikte alır.
    const groups = await groupRepo.find({
      relations: ["translations", "products"], //çok dilli çeviri ve ürünleri ile birlikte alır.
      order: { id: "ASC" } //id'ye göre artan sırada sıralar.
    });

    // Verileri frontend'e uygun formatta döndür.
    const result = groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      imageUrl: group.imageUrl,
      standard: group.standard,
      translations: group.translations || [],
      productCount: group.products?.length || 0
    }));
 
    //her group nesnesi sadeleştirilerek bir JSON objesi olarak döndürülür.
    //kısaca alınan verileri JSON formatına çevirir.
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Admin grup listesi alınamadı:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

