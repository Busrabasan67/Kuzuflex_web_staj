import { Request, Response } from 'express';
import AppDataSource from '../data-source';
import { AboutPage } from '../entity/AboutPage';
import { AboutPageTranslation } from '../entity/AboutPageTranslation';
import { AboutPageExtraContent } from '../entity/AboutPageExtraContent';

const aboutPageRepository = AppDataSource.getRepository(AboutPage);
const translationRepository = AppDataSource.getRepository(AboutPageTranslation);
const extraContentRepository = AppDataSource.getRepository(AboutPageExtraContent);

// Hakkımızda sayfasını getir
export const getAboutPage = async (req: Request, res: Response) => {
  try {
    const { lang } = req.query;
    
    const aboutPage = await aboutPageRepository.findOne({
      where: { slug: 'about-us' },
      relations: ['translations', 'extraContents'],
      order: {
        extraContents: {
          order: 'ASC'
        }
      }
    });

    if (!aboutPage) {
      return res.status(404).json({ message: 'Hakkımızda sayfası bulunamadı' });
    }

    // Eğer dil belirtilmişse, sadece o dildeki verileri döndür
    if (lang) {
      const filteredData = {
        ...aboutPage,
        translations: aboutPage.translations.filter(t => t.language === lang),
        extraContents: aboutPage.extraContents.filter(c => c.language === lang)
      };
      return res.json(filteredData);
    }

    res.json(aboutPage);
  } catch (error) {
    console.error('Error fetching about page:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Hakkımızda sayfası oluştur
export const createAboutPage = async (req: Request, res: Response) => {
  try {
    const { slug, heroImageUrl, translations } = req.body;

    // Mevcut sayfa var mı kontrol et
    const existingPage = await aboutPageRepository.findOne({
      where: { slug }
    });

    if (existingPage) {
      return res.status(400).json({ message: 'Bu slug ile sayfa zaten mevcut' });
    }

    // Yeni sayfa oluştur
    const aboutPage = aboutPageRepository.create({
      slug,
      heroImageUrl: heroImageUrl || '',
      translations: translations || []
    });

    const savedPage = await aboutPageRepository.save(aboutPage);

    // Çevirileri kaydet
    if (translations && translations.length > 0) {
      for (const translation of translations) {
        const translationEntity = translationRepository.create({
          ...translation,
          page: savedPage
        });
        await translationRepository.save(translationEntity);
      }
    }

    // Güncellenmiş sayfayı getir
    const updatedPage = await aboutPageRepository.findOne({
      where: { id: savedPage.id },
      relations: ['translations', 'extraContents']
    });

    res.status(201).json(updatedPage);
  } catch (error) {
    console.error('Error creating about page:', error);
    res.status(500).json({ message: 'Sayfa oluşturulurken hata oluştu' });
  }
};

// Hakkımızda sayfasını güncelle
export const updateAboutPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { heroImageUrl, translations } = req.body;

    const aboutPage = await aboutPageRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['translations']
    });

    if (!aboutPage) {
      return res.status(404).json({ message: 'Hakkımızda sayfası bulunamadı' });
    }

    // Ana sayfa bilgilerini güncelle
    aboutPage.heroImageUrl = heroImageUrl || aboutPage.heroImageUrl;
    await aboutPageRepository.save(aboutPage);

    // Çevirileri güncelle
    if (translations && translations.length > 0) {
      // Mevcut çevirileri sil
      await translationRepository.delete({ page: { id: aboutPage.id } });

      // Yeni çevirileri ekle
      for (const translation of translations) {
        const translationEntity = translationRepository.create({
          ...translation,
          page: aboutPage
        });
        await translationRepository.save(translationEntity);
      }
    }

    // Güncellenmiş sayfayı getir
    const updatedPage = await aboutPageRepository.findOne({
      where: { id: aboutPage.id },
      relations: ['translations', 'extraContents']
    });

    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating about page:', error);
    res.status(500).json({ message: 'Sayfa güncellenirken hata oluştu' });
  }
};

// Hakkımızda sayfasını sil
export const deleteAboutPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const aboutPage = await aboutPageRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!aboutPage) {
      return res.status(404).json({ message: 'Hakkımızda sayfası bulunamadı' });
    }

    await aboutPageRepository.remove(aboutPage);

    res.json({ message: 'Hakkımızda sayfası başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting about page:', error);
    res.status(500).json({ message: 'Sayfa silinirken hata oluştu' });
  }
};

// Tüm hakkımızda sayfalarını getir (admin için)
export const getAllAboutPages = async (req: Request, res: Response) => {
  try {
    const aboutPages = await aboutPageRepository.find({
      relations: ['translations', 'extraContents'],
      order: {
        extraContents: {
          order: 'ASC'
        }
      }
    });

    res.json(aboutPages);
  } catch (error) {
    console.error('Error fetching all about pages:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
