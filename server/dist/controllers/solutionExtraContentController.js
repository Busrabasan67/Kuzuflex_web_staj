"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExtraContent = exports.updateExtraContentGroup = exports.updateExtraContent = exports.getExtraContentById = exports.getAllExtraContentsForAdmin = exports.getExtraContents = exports.addMultiLanguageExtraContent = exports.addExtraContent = exports.uploadImage = exports.uploadExtraContentImage = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const Solution_1 = require("../entity/Solution");
const SolutionExtraContent_1 = require("../entity/SolutionExtraContent");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Basit resim upload için storage
const extraContentImageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, "../../public/uploads/solutions/extra-content");
        if (!fs_1.default.existsSync(uploadDir))
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `extra-content-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/"))
        cb(null, true);
    else
        cb(new Error("Sadece resim dosyaları yüklenebilir!"));
};
exports.uploadExtraContentImage = (0, multer_1.default)({ storage: extraContentImageStorage, fileFilter });
// Basit resim upload endpoint'i
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Dosya yüklenmedi" });
        }
        const fileUrl = `/uploads/solutions/extra-content/${req.file.filename}`;
        res.status(200).json({
            url: fileUrl,
            filename: req.file.filename
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: "Dosya yükleme hatası" });
    }
};
exports.uploadImage = uploadImage;
// Solution'ın hasExtraContent alanını güncelle
const updateSolutionHasExtraContent = async (solutionId) => {
    try {
        const extraContentRepo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        const solutionRepo = data_source_1.default.getRepository(Solution_1.Solution);
        // Bu solution için kaç tane ekstra içerik var?
        const extraContentCount = await extraContentRepo.count({
            where: { solution: { id: solutionId } }
        });
        // Solution'ı bul ve hasExtraContent'i güncelle
        const solution = await solutionRepo.findOne({
            where: { id: solutionId }
        });
        if (solution) {
            solution.hasExtraContent = extraContentCount > 0;
            await solutionRepo.save(solution);
        }
    }
    catch (error) {
        console.error('Error updating hasExtraContent:', error);
    }
};
// Ekstra içerik ekle
const addExtraContent = async (req, res) => {
    const { solutionId, type, title, content, order, language } = req.body;
    try {
        // Solution'ı bul
        const solutionRepo = data_source_1.default.getRepository(Solution_1.Solution);
        const solution = await solutionRepo.findOne({
            where: { id: solutionId }
        });
        if (!solution) {
            return res.status(404).json({ message: "Solution not found" });
        }
        // Ekstra içerik oluştur
        const extraContentRepo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        const extraContent = extraContentRepo.create({
            type,
            title,
            content,
            order: order || 1,
            language: language || "tr",
            solution
        });
        await extraContentRepo.save(extraContent);
        // Solution'ın hasExtraContent'ini güncelle
        await updateSolutionHasExtraContent(solutionId);
        res.status(201).json({
            message: "Extra content added successfully",
            extraContent
        });
    }
    catch (err) {
        res.status(500).json({ message: "Error adding extra content", error: err });
    }
};
exports.addExtraContent = addExtraContent;
// Çoklu dil için ekstra içerik ekle
const addMultiLanguageExtraContent = async (req, res) => {
    const { solutionId, type, contents, order } = req.body;
    try {
        // Solution'ı bul
        const solutionRepo = data_source_1.default.getRepository(Solution_1.Solution);
        const solution = await solutionRepo.findOne({
            where: { id: solutionId }
        });
        if (!solution) {
            return res.status(404).json({ message: "Solution not found" });
        }
        // contents array'i kontrol et
        if (!contents || !Array.isArray(contents) || contents.length === 0) {
            return res.status(400).json({ message: "Contents array is required" });
        }
        // Her dil için ekstra içerik oluştur
        const extraContentRepo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        const createdContents = [];
        for (const content of contents) {
            const { language, title, content: contentData } = content;
            if (!language || !title || !contentData) {
                return res.status(400).json({
                    message: `Missing required fields for language: ${language}`
                });
            }
            const extraContent = extraContentRepo.create({
                type,
                title,
                content: contentData,
                order: order || 1,
                language,
                solution
            });
            const savedContent = await extraContentRepo.save(extraContent);
            createdContents.push(savedContent);
        }
        // Solution'ın hasExtraContent'ini güncelle
        await updateSolutionHasExtraContent(solutionId);
        res.status(201).json({
            message: "Multi-language extra content added successfully",
            extraContents: createdContents
        });
    }
    catch (err) {
        res.status(500).json({ message: "Error adding multi-language extra content", error: err });
    }
};
exports.addMultiLanguageExtraContent = addMultiLanguageExtraContent;
// Solution'ın ekstra içeriklerini getir
const getExtraContents = async (req, res) => {
    const { solutionId } = req.params;
    const { language } = req.query;
    try {
        const repo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        const extraContents = await repo.find({
            where: {
                solution: { id: parseInt(solutionId) },
                language: language || "tr"
            },
            order: { order: "ASC" }
        });
        res.status(200).json(extraContents);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching extra contents", error: err });
    }
};
exports.getExtraContents = getExtraContents;
// Admin panel için tüm ekstra içerikleri getir
const getAllExtraContentsForAdmin = async (req, res) => {
    try {
        const repo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        const extraContents = await repo.find({
            relations: ["solution"],
            order: { order: "ASC" }
        });
        const response = extraContents.map((content) => ({
            id: content.id,
            type: content.type,
            title: content.title,
            content: content.content,
            order: content.order,
            language: content.language,
            solutionId: content.solution.id,
            solutionTitle: content.solution.slug // Solution slug'ını da ekle
        }));
        res.status(200).json(response);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching all extra contents", error: err });
    }
};
exports.getAllExtraContentsForAdmin = getAllExtraContentsForAdmin;
// Tek bir ekstra içeriği getir (düzenleme için)
const getExtraContentById = async (req, res) => {
    const { id } = req.params;
    try {
        const repo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        const extraContent = await repo.findOne({
            where: { id: parseInt(id) },
            relations: ["solution"]
        });
        if (!extraContent) {
            return res.status(404).json({ message: "Extra content not found" });
        }
        res.status(200).json(extraContent);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching extra content", error: err });
    }
};
exports.getExtraContentById = getExtraContentById;
// Ekstra içerik güncelle
const updateExtraContent = async (req, res) => {
    const { id } = req.params;
    const { type, title, content, order } = req.body;
    try {
        const repo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        const extraContent = await repo.findOne({
            where: { id: parseInt(id) }
        });
        if (!extraContent) {
            return res.status(404).json({ message: "Extra content not found" });
        }
        extraContent.type = type || extraContent.type;
        extraContent.title = title || extraContent.title;
        extraContent.content = content || extraContent.content;
        extraContent.order = order || extraContent.order;
        await repo.save(extraContent);
        res.status(200).json({
            message: "Extra content updated successfully",
            extraContent
        });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating extra content", error: err });
    }
};
exports.updateExtraContent = updateExtraContent;
// Grup bazlı ekstra içerik güncelle
const updateExtraContentGroup = async (req, res) => {
    const { groupId, solutionId, type, contents, order } = req.body;
    try {
        const repo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        // Önce mevcut grup içeriklerini bul
        const existingContents = await repo.find({
            where: {
                solution: { id: solutionId },
                order: order
            }
        });
        // Her dil için güncelleme yap
        for (const contentData of contents) {
            const { language, title, content } = contentData;
            // Bu dil için mevcut içeriği bul
            const existingContent = existingContents.find(ec => ec.language === language);
            if (existingContent) {
                // Mevcut içeriği güncelle
                existingContent.type = type;
                existingContent.title = title;
                existingContent.content = content;
                await repo.save(existingContent);
            }
            else {
                // Yeni içerik oluştur
                const newContent = repo.create({
                    solution: { id: solutionId },
                    type,
                    title,
                    content,
                    order,
                    language
                });
                await repo.save(newContent);
            }
        }
        // Solution'ın hasExtraContent'ini güncelle
        await updateSolutionHasExtraContent(solutionId);
        res.status(200).json({
            message: "Extra content group updated successfully",
            updatedCount: contents.length
        });
    }
    catch (err) {
        console.error('Grup güncelleme hatası:', err);
        res.status(500).json({ message: "Error updating extra content group", error: err });
    }
};
exports.updateExtraContentGroup = updateExtraContentGroup;
// Ekstra içerik sil
const deleteExtraContent = async (req, res) => {
    const { id } = req.params;
    try {
        const repo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
        const extraContent = await repo.findOne({
            where: { id: parseInt(id) },
            relations: ["solution"]
        });
        if (!extraContent) {
            return res.status(404).json({ message: "Extra content not found" });
        }
        await repo.remove(extraContent);
        // Solution'ın hasExtraContent'ini güncelle
        await updateSolutionHasExtraContent(extraContent.solution.id);
        res.status(200).json({ message: "Extra content deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting extra content", error: err });
    }
};
exports.deleteExtraContent = deleteExtraContent;
