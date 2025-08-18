"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtraContentsByLanguage = exports.deleteExtraContent = exports.updateGroupExtraContent = exports.updateExtraContent = exports.getAllExtraContents = exports.getExtraContent = exports.createExtraContent = exports.createMultiLanguageExtraContent = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const AboutPageExtraContent_1 = require("../entity/AboutPageExtraContent");
const AboutPage_1 = require("../entity/AboutPage");
const extraContentRepository = data_source_1.default.getRepository(AboutPageExtraContent_1.AboutPageExtraContent);
const aboutPageRepository = data_source_1.default.getRepository(AboutPage_1.AboutPage);
// Çoklu dil için ekstra içerik ekle
const createMultiLanguageExtraContent = async (req, res) => {
    try {
        const { type, contents, order } = req.body;
        // Hakkımızda sayfasını bul
        const aboutPage = await aboutPageRepository.findOne({
            where: { slug: 'contact' }
        });
        if (!aboutPage) {
            return res.status(404).json({ message: 'Hakkımızda sayfası bulunamadı' });
        }
        // Eğer order belirtilmemişse, mevcut en yüksek order'ı bul ve +1 ekle
        let finalOrder = order;
        if (!finalOrder) {
            const maxOrderContent = await extraContentRepository.findOne({
                where: { page: { id: aboutPage.id } },
                order: { order: 'DESC' }
            });
            finalOrder = maxOrderContent ? maxOrderContent.order + 1 : 1;
        }
        // Her dil için içerik oluştur
        const savedContents = [];
        for (const content of contents) {
            const extraContent = extraContentRepository.create({
                language: content.language,
                title: content.title,
                content: content.content,
                type,
                order: finalOrder,
                page: aboutPage
            });
            const savedContent = await extraContentRepository.save(extraContent);
            savedContents.push(savedContent);
        }
        res.status(201).json({
            message: 'Tüm diller için içerik başarıyla eklendi',
            contents: savedContents
        });
    }
    catch (error) {
        console.error('Error creating multi-language extra content:', error);
        res.status(500).json({ message: 'İçerik eklenirken hata oluştu' });
    }
};
exports.createMultiLanguageExtraContent = createMultiLanguageExtraContent;
// Tek ekstra içerik ekle
const createExtraContent = async (req, res) => {
    try {
        const { language, title, content, type, order } = req.body;
        // Hakkımızda sayfasını bul
        const aboutPage = await aboutPageRepository.findOne({
            where: { slug: 'contact' }
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
    }
    catch (error) {
        console.error('Error creating extra content:', error);
        res.status(500).json({ message: 'İçerik eklenirken hata oluştu' });
    }
};
exports.createExtraContent = createExtraContent;
// Ekstra içerik getir
const getExtraContent = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching extra content:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
exports.getExtraContent = getExtraContent;
// Tüm ekstra içerikleri getir
const getAllExtraContents = async (req, res) => {
    try {
        const extraContents = await extraContentRepository.find({
            relations: ['page'],
            order: {
                order: 'ASC',
                createdAt: 'DESC'
            }
        });
        res.json(extraContents);
    }
    catch (error) {
        console.error('Error fetching all extra contents:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
exports.getAllExtraContents = getAllExtraContents;
// Ekstra içerik güncelle
const updateExtraContent = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error updating extra content:', error);
        res.status(500).json({ message: 'İçerik güncellenirken hata oluştu' });
    }
};
exports.updateExtraContent = updateExtraContent;
// Grup güncelleme (tüm diller için)
const updateGroupExtraContent = async (req, res) => {
    try {
        const { groupId, type, contents, order, existingIds } = req.body;
        console.log('Grup güncelleme isteği:', { groupId, type, contents, order, existingIds });
        // Hakkımızda sayfasını bul
        const aboutPage = await aboutPageRepository.findOne({
            where: { slug: 'contact' }
        });
        if (!aboutPage) {
            return res.status(404).json({ message: 'Hakkımızda sayfası bulunamadı' });
        }
        // Mevcut grup içeriklerini bul (order'a göre)
        const existingContents = await extraContentRepository.find({
            where: { page: { id: aboutPage.id }, order: order }
        });
        console.log('Mevcut içerikler bulundu:', existingContents.length);
        const updatedContents = [];
        // Her dil için mevcut içeriği güncelle veya yeni oluştur
        for (const content of contents) {
            const existingContent = existingContents.find(ec => ec.language === content.language);
            if (existingContent) {
                // Mevcut içeriği güncelle - ID korunur
                existingContent.title = content.title;
                existingContent.content = content.content;
                existingContent.type = type;
                const updatedContent = await extraContentRepository.save(existingContent);
                updatedContents.push(updatedContent);
                console.log(`İçerik güncellendi: ID ${existingContent.id}, Dil: ${content.language}`);
            }
            else {
                // Yeni dil için içerik oluştur
                const newContent = extraContentRepository.create({
                    language: content.language,
                    title: content.title,
                    content: content.content,
                    type,
                    order: order,
                    page: aboutPage
                });
                const savedContent = await extraContentRepository.save(newContent);
                updatedContents.push(savedContent);
                console.log(`Yeni içerik eklendi: ID ${savedContent.id}, Dil: ${content.language}`);
            }
        }
        console.log('Güncelleme tamamlandı. Toplam içerik:', updatedContents.length);
        console.log('Güncellenen ID\'ler:', updatedContents.map(c => c.id));
        res.json({
            message: 'Grup içerikleri başarıyla güncellendi',
            contents: updatedContents
        });
    }
    catch (error) {
        console.error('Error updating group extra content:', error);
        res.status(500).json({ message: 'Grup güncellenirken hata oluştu' });
    }
};
exports.updateGroupExtraContent = updateGroupExtraContent;
// Ekstra içerik sil
const deleteExtraContent = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting extra content:', error);
        res.status(500).json({ message: 'İçerik silinirken hata oluştu' });
    }
};
exports.deleteExtraContent = deleteExtraContent;
// Dil bazında ekstra içerikleri getir
const getExtraContentsByLanguage = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching extra contents by language:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
exports.getExtraContentsByLanguage = getExtraContentsByLanguage;
