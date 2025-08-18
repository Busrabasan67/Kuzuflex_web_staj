import { Request, Response } from "express";
import qmDocumentsService from "../services/qmDocumentsService";

// Tüm QM Documents'ları getir
export const getAllQMDocumentsAndCertificates = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";

  try {
    const result = await qmDocumentsService.getAllQMDocumentsAndCertificates(lang);
    return res.json(result);
  } catch (error) {
    console.error("QM Documents API hatası:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
};

// Belirli bir QM Document'ı getir
export const getQMDocumentAndCertificateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const lang = (req.query.lang as string) || "tr";

  try {
    const result = await qmDocumentsService.getQMDocumentAndCertificateById(parseInt(id), lang);
    return res.json(result);
  } catch (error) {
    console.error("QM Document API hatası:", error);
    const statusCode = error instanceof Error && error.message.includes("bulunamadı") ? 404 : 500;
    return res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
};

// Yeni QM Document oluştur
export const createQMDocumentAndCertificate = async (req: Request, res: Response) => {
  try {
    const result = await qmDocumentsService.createQMDocumentAndCertificate(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("QM Document oluşturma hatası:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
};

// QM Document güncelle
export const updateQMDocumentAndCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await qmDocumentsService.updateQMDocumentAndCertificate(parseInt(id), req.body);
    return res.json(result);
  } catch (error) {
    console.error("QM Document güncelleme hatası:", error);
    const statusCode = error instanceof Error && error.message.includes("bulunamadı") ? 404 : 500;
    return res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
};

// QM Document sil
export const deleteQMDocumentAndCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await qmDocumentsService.deleteQMDocumentAndCertificate(parseInt(id));
    return res.json(result);
  } catch (error) {
    console.error("QM Document silme hatası:", error);
    const statusCode = error instanceof Error && error.message.includes("bulunamadı") ? 404 : 500;
    return res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : "Sunucu hatası" 
    });
  }
}; 