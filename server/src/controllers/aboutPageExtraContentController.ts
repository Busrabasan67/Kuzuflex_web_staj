import { Request, Response } from 'express';
import aboutPageExtraContentService from '../services/aboutPageExtraContentService';

// Çoklu dil için ekstra içerik ekle
export const createMultiLanguageExtraContent = async (req: Request, res: Response) => {
  try {
    const result = await aboutPageExtraContentService.createMultiLanguageExtraContent(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating multi-language extra content:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'İçerik eklenirken hata oluştu' 
    });
  }
};

// Tek ekstra içerik ekle
export const createExtraContent = async (req: Request, res: Response) => {
  try {
    const result = await aboutPageExtraContentService.createExtraContent(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating extra content:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'İçerik eklenirken hata oluştu' 
    });
  }
};

// Ekstra içerik getir
export const getExtraContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await aboutPageExtraContentService.getExtraContent(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error fetching extra content:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'Sunucu hatası' 
    });
  }
};

// Tüm ekstra içerikleri getir
export const getAllExtraContents = async (req: Request, res: Response) => {
  try {
    const result = await aboutPageExtraContentService.getAllExtraContents();
    res.json(result);
  } catch (error) {
    console.error('Error fetching all extra contents:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Sunucu hatası' 
    });
  }
};

// Ekstra içerik güncelle
export const updateExtraContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await aboutPageExtraContentService.updateExtraContent(parseInt(id), req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating extra content:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'İçerik güncellenirken hata oluştu' 
    });
  }
};

// Grup güncelleme (tüm diller için)
export const updateGroupExtraContent = async (req: Request, res: Response) => {
  try {
    const result = await aboutPageExtraContentService.updateGroupExtraContent(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating group extra content:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'Grup güncellenirken hata oluştu' 
    });
  }
};

// Ekstra içerik sil
export const deleteExtraContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await aboutPageExtraContentService.deleteExtraContent(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error deleting extra content:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'İçerik silinirken hata oluştu' 
    });
  }
};

// Dil bazında ekstra içerikleri getir
export const getExtraContentsByLanguage = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const result = await aboutPageExtraContentService.getExtraContentsByLanguage(language);
    res.json(result);
  } catch (error) {
    console.error('Error fetching extra contents by language:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Sunucu hatası' 
    });
  }
};
