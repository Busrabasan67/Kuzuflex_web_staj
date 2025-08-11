import { Request, Response } from 'express';
import  AppDataSource  from '../data-source';
import { AboutPageExtraContent } from '../entity/AboutPageExtraContent';
import { AboutPage } from '../entity/AboutPage';

const extraContentRepository = AppDataSource.getRepository(AboutPageExtraContent);
const aboutPageRepository = AppDataSource.getRepository(AboutPage);

// Çoklu dil için ekstra içerik ekle
export const createMultiLanguageExtraContent = async (req: Request, res: Response) => {
  try {
    const { type, contents, order } = req.body;

    // Hakkımızda sayfasını bul
    const aboutPage = await aboutPageRepository.findOne({
      where: { slug: 'about-us' }
    });

    if (!aboutPage) {
      return res.status(404).json({ message: 'Hakkımızda sayfası bulunamadı' });
    }

    // Her dil için içerik oluştur
    const savedContents = [];
    for (const content of contents) {
      const extraContent = extraContentRepository.create({
        language: content.language,
        title: content.title,
        content: content.content,
        type,
        order: order || 1,
        page: aboutPage
      });

      const savedContent = await extraContentRepository.save(extraContent);
      savedContents.push(savedContent);
    }

    res.status(201).json({
      message: 'Tüm diller için içerik başarıyla eklendi',
      contents: savedContents
    });
  } catch (error) {
    console.error('Error creating multi-language extra content:', error);
    res.status(500).json({ message: 'İçerik eklenirken hata oluştu' });
  }
};

// Tek ekstra içerik ekle
export const createExtraContent = async (req: Request, res: Response) => {
  try {
    const { language, title, content, type, order } = req.body;

    // Hakkımızda sayfasını bul
    const aboutPage = await aboutPageRepository.findOne({
      where: { slug: 'about-us' }
    });

    if (!aboutPage) {
      return res.status(404).json({ message: 'Hakkımızda sayfası bulunamadı' });
    }

    const extraContent = extraContentRepository.create({
      language,
      title,
      content,
      type,
      order: order || 1,
      page: aboutPage
    });

    const savedContent = await extraContentRepository.save(extraContent);

    res.status(201).json(savedContent);
  } catch (error) {
    console.error('Error creating extra content:', error);
    res.status(500).json({ message: 'İçerik eklenirken hata oluştu' });
  }
};

// Ekstra içerik getir
export const getExtraContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const extraContent = await extraContentRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['page']
    });

    if (!extraContent) {
      return res.status(404).json({ message: 'İçerik bulunamadı' });
    }

    res.json(extraContent);
  } catch (error) {
    console.error('Error fetching extra content:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tüm ekstra içerikleri getir
export const getAllExtraContents = async (req: Request, res: Response) => {
  try {
    const extraContents = await extraContentRepository.find({
      relations: ['page'],
      order: {
        order: 'ASC',
        createdAt: 'DESC'
      }
    });

    res.json(extraContents);
  } catch (error) {
    console.error('Error fetching all extra contents:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Ekstra içerik güncelle
export const updateExtraContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language, title, content, type, order } = req.body;

    const extraContent = await extraContentRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!extraContent) {
      return res.status(404).json({ message: 'İçerik bulunamadı' });
    }

    // İçeriği güncelle
    extraContent.language = language || extraContent.language;
    extraContent.title = title || extraContent.title;
    extraContent.content = content || extraContent.content;
    extraContent.type = type || extraContent.type;
    extraContent.order = order || extraContent.order;

    const updatedContent = await extraContentRepository.save(extraContent);

    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating extra content:', error);
    res.status(500).json({ message: 'İçerik güncellenirken hata oluştu' });
  }
};

// Grup güncelleme (tüm diller için)
export const updateGroupExtraContent = async (req: Request, res: Response) => {
  try {
    const { groupId, type, contents, order } = req.body;

    // Hakkımızda sayfasını bul
    const aboutPage = await aboutPageRepository.findOne({
      where: { slug: 'about-us' }
    });

    if (!aboutPage) {
      return res.status(404).json({ message: 'Hakkımızda sayfası bulunamadı' });
    }

    // Mevcut grup içeriklerini sil
    await extraContentRepository.delete({ page: { id: aboutPage.id }, type });

    // Yeni içerikleri ekle
    const savedContents = [];
    for (const content of contents) {
      const extraContent = extraContentRepository.create({
        language: content.language,
        title: content.title,
        content: content.content,
        type,
        order: order || 1,
        page: aboutPage
      });

      const savedContent = await extraContentRepository.save(extraContent);
      savedContents.push(savedContent);
    }

    res.json({
      message: 'Grup içerikleri başarıyla güncellendi',
      contents: savedContents
    });
  } catch (error) {
    console.error('Error updating group extra content:', error);
    res.status(500).json({ message: 'Grup güncellenirken hata oluştu' });
  }
};

// Ekstra içerik sil
export const deleteExtraContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const extraContent = await extraContentRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!extraContent) {
      return res.status(404).json({ message: 'İçerik bulunamadı' });
    }

    await extraContentRepository.remove(extraContent);

    res.json({ message: 'İçerik başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting extra content:', error);
    res.status(500).json({ message: 'İçerik silinirken hata oluştu' });
  }
};

// Dil bazında ekstra içerikleri getir
export const getExtraContentsByLanguage = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;

    const extraContents = await extraContentRepository.find({
      where: { language },
      relations: ['page'],
      order: {
        order: 'ASC'
      }
    });

    res.json(extraContents);
  } catch (error) {
    console.error('Error fetching extra contents by language:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
