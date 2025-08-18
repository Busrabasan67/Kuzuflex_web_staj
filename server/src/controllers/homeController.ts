// server/src/controllers/homeController.ts
import { Request, Response } from 'express';
import homeService from '../services/homeService';

// Ana sayfa verilerini getir
export const getHomeData = async (req: Request, res: Response) => {
  try {
    // Dil parametresini al
    const language = (req.query.lang as string) || 'tr';
    
    // HomeService kullanarak verileri getir
    const responseData = await homeService.getHomeData(language);
    
    // Response'u gönder
    res.json(responseData);

  } catch (error) {
    console.error('Home data fetch error:', error);
    res.status(500).json({ 
      message: 'Ana sayfa verileri yüklenemedi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
