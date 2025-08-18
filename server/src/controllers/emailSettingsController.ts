import { Request, Response } from 'express';
import emailSettingsService from '../services/emailSettingsService';

export const getEmailSettings = async (req: Request, res: Response) => {
  try {
    const settings = await emailSettingsService.getEmailSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Email settings getirme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Email ayarları alınamadı' 
    });
  }
};

export const updateEmailSettings = async (req: Request, res: Response) => {
  try {
    const savedSettings = await emailSettingsService.updateEmailSettings(req.body);
    
    res.json({ 
      success: true, 
      message: 'Email ayarları güncellendi',
      data: savedSettings 
    });
  } catch (error) {
    console.error('Email settings güncelleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Email ayarları güncellenemedi' 
    });
  }
};

export const testEmailConnection = async (req: Request, res: Response) => {
  try {
    const result = await emailSettingsService.testEmailConnection();
    res.json(result);
  } catch (error) {
    console.error('Test email hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Test email gönderilemedi' 
    });
  }
};
