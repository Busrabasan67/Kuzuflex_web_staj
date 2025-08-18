"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAboutPages = exports.deleteAboutPage = exports.updateAboutPage = exports.createAboutPage = exports.getAboutPage = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const AboutPage_1 = require("../entity/AboutPage");
const AboutPageTranslation_1 = require("../entity/AboutPageTranslation");
const AboutPageExtraContent_1 = require("../entity/AboutPageExtraContent");
const aboutPageRepository = data_source_1.default.getRepository(AboutPage_1.AboutPage);
const translationRepository = data_source_1.default.getRepository(AboutPageTranslation_1.AboutPageTranslation);
const extraContentRepository = data_source_1.default.getRepository(AboutPageExtraContent_1.AboutPageExtraContent);
// Hakkımızda sayfasını getir
const getAboutPage = async (req, res) => {
    try {
        const { lang } = req.query;
        const aboutPage = await aboutPageRepository.findOne({
            where: { slug: 'contact' },
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
    }
    catch (error) {
        console.error('Error fetching about page:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
exports.getAboutPage = getAboutPage;
// Hakkımızda sayfası oluştur
const createAboutPage = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error creating about page:', error);
        res.status(500).json({ message: 'Sayfa oluşturulurken hata oluştu' });
    }
};
exports.createAboutPage = createAboutPage;
// Hakkımızda sayfasını güncelle
const updateAboutPage = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error updating about page:', error);
        res.status(500).json({ message: 'Sayfa güncellenirken hata oluştu' });
    }
};
exports.updateAboutPage = updateAboutPage;
// Hakkımızda sayfasını sil
const deleteAboutPage = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting about page:', error);
        res.status(500).json({ message: 'Sayfa silinirken hata oluştu' });
    }
};
exports.deleteAboutPage = deleteAboutPage;
// Tüm hakkımızda sayfalarını getir (admin için)
const getAllAboutPages = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching all about pages:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
exports.getAllAboutPages = getAllAboutPages;
