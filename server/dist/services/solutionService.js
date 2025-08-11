"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solutionService = exports.SolutionService = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const SolutionTranslation_1 = require("../entity/SolutionTranslation");
const SolutionExtraContent_1 = require("../entity/SolutionExtraContent");
const Solution_1 = require("../entity/Solution");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Dosya silme yardımcı fonksiyonu
const deleteFileIfExists = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Dosya silindi: ${filePath}`);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error(`❌ Dosya silinirken hata: ${filePath}`, error);
        return false;
    }
};
// Dosya yolu oluşturma yardımcı fonksiyonu
const getPublicFilePath = (relativePath) => {
    return path.join(__dirname, "../../public", relativePath);
};
class SolutionService {
    constructor() {
        this.solutionRepo = data_source_1.default.getRepository(Solution_1.Solution);
        this.translationRepo = data_source_1.default.getRepository(SolutionTranslation_1.SolutionTranslation);
        this.extraContentRepo = data_source_1.default.getRepository(SolutionExtraContent_1.SolutionExtraContent);
    }
    // Tüm solution'ları getir
    async getAllSolutions(lang = "tr") {
        try {
            const solutions = await this.translationRepo.find({
                where: { language: lang },
                relations: ["solution"],
            });
            return solutions.map((item) => ({
                id: item.solution.id,
                slug: item.solution.slug,
                title: item.title,
                imageUrl: item.solution.imageUrl,
            }));
        }
        catch (error) {
            throw new Error(`Solution'lar getirilemedi: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Slug'a göre solution getir
    async getSolutionBySlug(slug, lang = "tr") {
        try {
            const translation = await this.translationRepo.findOne({
                where: {
                    language: lang,
                    solution: { slug },
                },
                relations: ["solution"],
            });
            if (!translation) {
                throw new Error("Solution bulunamadı");
            }
            let extraContents = [];
            if (translation.solution.hasExtraContent) {
                extraContents = await this.extraContentRepo.find({
                    where: {
                        solution: { id: translation.solution.id },
                        language: lang,
                    },
                    order: { order: "ASC" },
                });
            }
            return {
                id: translation.solution.id,
                slug: translation.solution.slug,
                imageUrl: translation.solution.imageUrl,
                title: translation.title,
                subtitle: translation.subtitle,
                description: translation.description,
                hasExtraContent: translation.solution.hasExtraContent,
                extraContents,
            };
        }
        catch (error) {
            throw new Error(`Solution detayı getirilemedi: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Admin için tüm solution'ları getir
    async getSolutionsForAdmin() {
        try {
            const solutions = await this.translationRepo.find({
                where: { language: "tr" },
                relations: ["solution"],
            });
            return solutions.map((item) => ({
                id: item.solution.id,
                slug: item.solution.slug,
                title: item.title,
                description: item.description,
                imageUrl: item.solution.imageUrl,
                hasExtraContent: item.solution.hasExtraContent,
                createdAt: item.solution.createdAt,
                updatedAt: item.solution.updatedAt,
            }));
        }
        catch (error) {
            throw new Error(`Admin solution'ları getirilemedi: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Düzenleme için solution detaylarını getir
    async getSolutionForEdit(id) {
        try {
            const solution = await this.solutionRepo.findOne({
                where: { id },
                relations: ["translations"]
            });
            if (!solution) {
                throw new Error("Solution bulunamadı");
            }
            // Tüm diller için translation'ları hazırla
            const allLanguages = ['tr', 'en', 'de', 'fr'];
            const translations = allLanguages.map(lang => {
                const existingTranslation = solution.translations?.find(t => t.language === lang);
                return {
                    language: lang,
                    title: existingTranslation?.title || '',
                    subtitle: existingTranslation?.subtitle || '',
                    description: existingTranslation?.description || ''
                };
            });
            return {
                id: solution.id,
                slug: solution.slug,
                imageUrl: solution.imageUrl,
                hasExtraContent: solution.hasExtraContent,
                translations: translations
            };
        }
        catch (error) {
            throw new Error(`Solution düzenleme verisi getirilemedi: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Yeni solution oluştur
    async createSolution(data) {
        try {
            // Slug kontrolü
            const existingSolution = await this.solutionRepo.findOne({
                where: { slug: data.slug }
            });
            if (existingSolution) {
                throw new Error("Bu slug zaten kullanılıyor");
            }
            // Solution oluştur
            const solution = this.solutionRepo.create({
                slug: data.slug,
                imageUrl: data.imageUrl,
                hasExtraContent: data.hasExtraContent || false
            });
            const savedSolution = await this.solutionRepo.save(solution);
            // Translation'ları oluştur
            if (data.translations && Array.isArray(data.translations)) {
                for (const translation of data.translations) {
                    const newTranslation = this.translationRepo.create({
                        language: translation.language,
                        title: translation.title,
                        subtitle: translation.subtitle,
                        description: translation.description,
                        solution: savedSolution
                    });
                    await this.translationRepo.save(newTranslation);
                }
            }
            return {
                message: "Solution başarıyla oluşturuldu",
                solution: savedSolution
            };
        }
        catch (error) {
            throw new Error(`Solution oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Solution güncelle
    async updateSolution(id, data) {
        try {
            console.log('🔄 Solution güncelleme işlemi başlatıldı, ID:', id);
            const solution = await this.solutionRepo.findOne({
                where: { id },
                relations: ["translations"]
            });
            if (!solution) {
                throw new Error("Solution bulunamadı");
            }
            console.log('🔍 Solution bulundu:', solution.id, solution.slug);
            // Slug kontrolü (kendisi hariç)
            if (data.slug && data.slug !== solution.slug) {
                const existingSolution = await this.solutionRepo.findOne({
                    where: { slug: data.slug }
                });
                if (existingSolution) {
                    throw new Error("Bu slug zaten kullanılıyor");
                }
            }
            // Eski resmi sil (eğer yeni resim yüklendiyse)
            if (solution.imageUrl && data.imageUrl && solution.imageUrl !== data.imageUrl) {
                console.log('🗑️ Eski solution resmi siliniyor:', solution.imageUrl);
                const oldImagePath = getPublicFilePath(solution.imageUrl);
                deleteFileIfExists(oldImagePath);
            }
            // Solution güncelle
            solution.slug = data.slug || solution.slug;
            solution.imageUrl = data.imageUrl || solution.imageUrl;
            solution.hasExtraContent = data.hasExtraContent !== undefined ? data.hasExtraContent : solution.hasExtraContent;
            solution.updatedAt = new Date(); // Manuel olarak güncelle
            await this.solutionRepo.save(solution);
            // Translation'ları güncelle
            if (data.translations && Array.isArray(data.translations)) {
                for (const translation of data.translations) {
                    const existingTranslation = await this.translationRepo.findOne({
                        where: {
                            solution: { id },
                            language: translation.language
                        }
                    });
                    if (existingTranslation) {
                        // Güncelle
                        existingTranslation.title = translation.title;
                        existingTranslation.subtitle = translation.subtitle;
                        existingTranslation.description = translation.description;
                        await this.translationRepo.save(existingTranslation);
                    }
                    else {
                        // Yeni oluştur
                        const newTranslation = this.translationRepo.create({
                            language: translation.language,
                            title: translation.title,
                            subtitle: translation.subtitle,
                            description: translation.description,
                            solution: solution
                        });
                        await this.translationRepo.save(newTranslation);
                    }
                }
            }
            console.log('✅ Solution başarıyla güncellendi');
            return {
                message: "Solution başarıyla güncellendi",
                solution: solution
            };
        }
        catch (error) {
            console.error('❌ Solution güncelleme hatası:', error);
            throw new Error(`Solution güncellenemedi: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Solution sil
    async deleteSolution(id) {
        try {
            console.log('🗑️ Solution silme işlemi başlatıldı, ID:', id);
            const solution = await this.solutionRepo.findOne({
                where: { id },
                relations: ["translations", "extraContents"]
            });
            if (!solution) {
                throw new Error("Solution bulunamadı");
            }
            console.log('🔍 Solution bulundu:', solution.id, solution.slug);
            // Ekstra içerik sayısını al
            const extraContentCount = solution.extraContents?.length || 0;
            const translationCount = solution.translations?.length || 0;
            // 1. Önce ekstra içerikleri sil
            if (extraContentCount > 0) {
                console.log('🗑️ Solution ekstra içerikleri siliniyor...');
                await this.extraContentRepo.delete({
                    solution: { id }
                });
            }
            // 2. Translation'ları sil
            if (translationCount > 0) {
                console.log('🗑️ Solution translation\'ları siliniyor...');
                await this.translationRepo.delete({
                    solution: { id }
                });
            }
            // 3. Solution resmini sil (eğer varsa)
            if (solution.imageUrl) {
                console.log('🗑️ Solution resmi siliniyor:', solution.imageUrl);
                const imagePath = getPublicFilePath(solution.imageUrl);
                deleteFileIfExists(imagePath);
            }
            // 4. Solution'ı sil
            console.log('🗑️ Solution siliniyor...');
            await this.solutionRepo.remove(solution);
            console.log('✅ Solution başarıyla silindi');
            return {
                message: `Solution başarıyla silindi`,
                deletedItems: {
                    solution: 1,
                    translations: translationCount,
                    extraContents: extraContentCount
                }
            };
        }
        catch (error) {
            console.error('❌ Solution silme hatası:', error);
            throw new Error(`Solution silinemedi: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.SolutionService = SolutionService;
// Singleton instance
exports.solutionService = new SolutionService();
