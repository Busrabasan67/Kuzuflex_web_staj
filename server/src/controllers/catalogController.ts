import { Request, Response } from "express";
import catalogService from "../services/catalogService";

// 1. Bir alt ürünün kataloglarını getir
export const getCatalogsByProduct = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const lang = (req.query.lang as string) || "tr";
  
  try {
    const result = await catalogService.getCatalogsByProduct(productId, lang);
    return res.json(result);
  } catch (error) {
    console.error("Katalog getirme hatası:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
};

// 2. Katalog ekle (PDF + çeviri)
export const addCatalogToProduct = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const { translations } = req.body;
  const file = req.file;

  try {
    const result = await catalogService.addCatalogToProduct(productId, translations, file);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Katalog ekleme hatası:", error);
    const statusCode = error instanceof Error && error.message.includes("gerekli") ? 400 : 500;
    return res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
};

// 3. Katalog sil
export const deleteCatalog = async (req: Request, res: Response) => {
  const catalogId = parseInt(req.params.catalogId);
  
  try {
    const result = await catalogService.deleteCatalog(catalogId);
    return res.json(result);
  } catch (error) {
    console.error("Katalog silme hatası:", error);
    const statusCode = error instanceof Error && error.message.includes("bulunamadı") ? 404 : 500;
    return res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
};

// 4. Katalog güncelle (çeviri/dosya)
export const updateCatalog = async (req: Request, res: Response) => {
  const catalogId = parseInt(req.params.catalogId);
  const { translations } = req.body;
  const file = req.file;

  try {
    const result = await catalogService.updateCatalog(catalogId, translations, file);
    return res.json(result);
  } catch (error) {
    console.error("Katalog güncelleme hatası:", error);
    const statusCode = error instanceof Error && error.message.includes("gerekli") ? 400 : 
                      error instanceof Error && error.message.includes("bulunamadı") ? 404 : 500;
    return res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
}; 