import { Request, Response } from "express";
import solutionExtraContentService from "../services/solutionExtraContentService";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";

// Basit resim upload için storage
const extraContentImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../public/uploads/solutions/extra-content");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `extra-content-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Sadece resim dosyaları yüklenebilir!"));
};

export const uploadExtraContentImage = multer({ storage: extraContentImageStorage, fileFilter });

// Basit resim upload endpoint'i
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Dosya yüklenmedi" });
    }

    const fileUrl = `/uploads/solutions/extra-content/${req.file.filename}`;
    
    res.status(200).json({
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: "Dosya yükleme hatası" });
  }
};



// Ekstra içerik ekle
export const addExtraContent = async (req: Request, res: Response) => {
  const { solutionId, type, title, content, order, language } = req.body;

  try {
    const extraContent = await solutionExtraContentService.addExtraContent(
      solutionId, type, title, content, order, language
    );

    res.status(201).json({
      message: "Extra content added successfully",
      extraContent
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error adding extra content";
    res.status(500).json({ message: errorMessage, error: err });
  }
};

// Çoklu dil için ekstra içerik ekle
export const addMultiLanguageExtraContent = async (req: Request, res: Response) => {
  const { solutionId, type, contents, order } = req.body;

  try {
    const createdContents = await solutionExtraContentService.addMultiLanguageExtraContent(
      solutionId, type, contents, order
    );

    res.status(201).json({
      message: "Multi-language extra content added successfully",
      extraContents: createdContents
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error adding multi-language extra content";
    res.status(500).json({ message: errorMessage, error: err });
  }
};

// Solution'ın ekstra içeriklerini getir
export const getExtraContents = async (req: Request, res: Response) => {
  const { solutionId } = req.params;
  const { language } = req.query;

  try {
    const extraContents = await solutionExtraContentService.getExtraContents(
      parseInt(solutionId), (language as string) || "tr"
    );

    res.status(200).json(extraContents);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error fetching extra contents";
    res.status(500).json({ message: errorMessage, error: err });
  }
};

// Admin panel için tüm ekstra içerikleri getir
export const getAllExtraContentsForAdmin = async (req: Request, res: Response) => {
  try {
    const extraContents = await solutionExtraContentService.getAllExtraContentsForAdmin();

    res.status(200).json(extraContents);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error fetching all extra contents";
    res.status(500).json({ message: errorMessage, error: err });
  }
};

// Tek bir ekstra içeriği getir (düzenleme için)
export const getExtraContentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const extraContent = await solutionExtraContentService.getExtraContentById(parseInt(id));

    res.status(200).json(extraContent);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error fetching extra content";
    res.status(500).json({ message: errorMessage, error: err });
  }
};

// Ekstra içerik güncelle
export const updateExtraContent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, title, content, order } = req.body;

  try {
    const extraContent = await solutionExtraContentService.updateExtraContent(
      parseInt(id), type, title, content, order
    );

    res.status(200).json({
      message: "Extra content updated successfully",
      extraContent
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error updating extra content";
    res.status(500).json({ message: errorMessage, error: err });
  }
};

// Grup bazlı ekstra içerik güncelle
export const updateExtraContentGroup = async (req: Request, res: Response) => {
  const { groupId, solutionId, type, contents, order } = req.body;

  try {
    const updatedCount = await solutionExtraContentService.updateExtraContentGroup(
      groupId, solutionId, type, contents, order
    );

    res.status(200).json({
      message: "Extra content group updated successfully",
      updatedCount
    });
  } catch (err) {
    console.error('Grup güncelleme hatası:', err);
    const errorMessage = err instanceof Error ? err.message : "Error updating extra content group";
    res.status(500).json({ message: errorMessage, error: err });
  }
};

// Ekstra içerik sil
export const deleteExtraContent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await solutionExtraContentService.deleteExtraContent(parseInt(id));

    res.status(200).json({ message: "Extra content deleted successfully" });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error deleting extra content";
    res.status(500).json({ message: errorMessage, error: err });
  }
};

