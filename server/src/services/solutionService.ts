import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { SolutionTranslation } from "../entity/SolutionTranslation";
import { SolutionExtraContent } from "../entity/SolutionExtraContent";
import { Solution } from "../entity/Solution";
import * as fs from "fs";
import * as path from "path";

// Dosya silme yardımcı fonksiyonu
const deleteFileIfExists = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Dosya silindi: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Dosya silinirken hata: ${filePath}`, error);
    return false;
  }
};

// Dosya yolu oluşturma yardımcı fonksiyonu
const getPublicFilePath = (relativePath: string) => {
  return path.join(__dirname, "../../public", relativePath);
};

export class SolutionService {
  private solutionRepo = AppDataSource.getRepository(Solution);
  private translationRepo = AppDataSource.getRepository(SolutionTranslation);
  private extraContentRepo = AppDataSource.getRepository(SolutionExtraContent);

  // Tüm solution'ları getir
  async getAllSolutions(lang: string = "tr") {
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
    } catch (error) {
      throw new Error(`Solution'lar getirilemedi: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Slug'a göre solution getir
  async getSolutionBySlug(slug: string, lang: string = "tr") {
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

      let extraContents: SolutionExtraContent[] = [];
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
    } catch (error) {
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
      }));
    } catch (error) {
      throw new Error(`Admin solution'ları getirilemedi: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Düzenleme için solution detaylarını getir
  async getSolutionForEdit(id: number) {
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
    } catch (error) {
      throw new Error(`Solution düzenleme verisi getirilemedi: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Yeni solution oluştur
  async createSolution(data: {
    slug: string;
    imageUrl: string;
    hasExtraContent: boolean;
    translations: any[];
  }) {
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
    } catch (error) {
      throw new Error(`Solution oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Solution güncelle
  async updateSolution(id: number, data: {
    slug?: string;
    imageUrl?: string;
    hasExtraContent?: boolean;
    translations?: any[];
  }) {
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
          } else {
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
    } catch (error) {
      console.error('❌ Solution güncelleme hatası:', error);
      throw new Error(`Solution güncellenemedi: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Solution sil
  async deleteSolution(id: number) {
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
    } catch (error) {
      console.error('❌ Solution silme hatası:', error);
      throw new Error(`Solution silinemedi: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Singleton instance
export const solutionService = new SolutionService(); 