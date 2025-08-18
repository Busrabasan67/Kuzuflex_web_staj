import { Request, Response } from 'express';
import aboutPageService from '../services/aboutPageService';

// Hakkımızda sayfasını getir
export const getAboutPage = async (req: Request, res: Response) => {
  try {
    const { lang } = req.query;
    const result = await aboutPageService.getAboutPage(lang as string);
    res.json(result);
  } catch (error) {
    console.error('Error fetching about page:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'Sunucu hatası' 
    });
  }
};

// Hakkımızda sayfası oluştur
export const createAboutPage = async (req: Request, res: Response) => {
  try {
    const result = await aboutPageService.createAboutPage(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating about page:', error);
    const statusCode = error instanceof Error && error.message.includes('zaten mevcut') ? 400 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'Sayfa oluşturulurken hata oluştu' 
    });
  }
};

// Hakkımızda sayfasını güncelle
export const updateAboutPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await aboutPageService.updateAboutPage(parseInt(id), req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating about page:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'Sayfa güncellenirken hata oluştu' 
    });
  }
};

// Hakkımızda sayfasını sil
export const deleteAboutPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await aboutPageService.deleteAboutPage(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error deleting about page:', error);
    const statusCode = error instanceof Error && error.message.includes('bulunamadı') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error instanceof Error ? error.message : 'Sayfa silinirken hata oluştu' 
    });
  }
};

// Tüm hakkımızda sayfalarını getir (admin için)
export const getAllAboutPages = async (req: Request, res: Response) => {
  try {
    const result = await aboutPageService.getAllAboutPages();
    res.json(result);
  } catch (error) {
    console.error('Error fetching all about pages:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Sunucu hatası' 
    });
  }
};
