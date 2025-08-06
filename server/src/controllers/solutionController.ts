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
  // __dirname: server/src/controllers
  // İhtiyacımız: server/public
  return path.join(__dirname, "../../public", relativePath);
};

export const getAllSolutions = async (req: Request, res: Response) => {
  const lang = req.query.lang as string || "tr";

  try {
    const repo = AppDataSource.getRepository(SolutionTranslation);
    const solutions = await repo.find({
      where: { language: lang },
      relations: ["solution"],
    });

    const response = solutions.map((item) => ({
      id: item.solution.id,
      slug: item.solution.slug,
      title: item.title,
      imageUrl: item.solution.imageUrl,
    }));

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Error fetching solutions", error: err });
  }
};

export const getSolutionBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const lang = req.query.lang as string || "tr";

  try {
    const repo = AppDataSource.getRepository(SolutionTranslation);
    const translation = await repo.findOne({
      where: {
        language: lang,
        solution: { slug },
      },
      relations: ["solution"],
    });

    if (!translation) {
      return res.status(404).json({ message: "Solution not found" });
    }

    let extraContents: SolutionExtraContent[] = [];
    if (translation.solution.hasExtraContent) {
      const extraRepo = AppDataSource.getRepository(SolutionExtraContent);
      extraContents = await extraRepo.find({
        where: {
          solution: { id: translation.solution.id },
          language: lang,
        },
        order: { order: "ASC" },
      });
    }

    res.status(200).json({
      id: translation.solution.id,
      slug: translation.solution.slug,
      imageUrl: translation.solution.imageUrl,
      title: translation.title,
      subtitle: translation.subtitle,
      description: translation.description,
      hasExtraContent: translation.solution.hasExtraContent,
      extraContents,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching solution detail", error: err });
  }
};

// Admin panel için tüm solution'ları getir
export const getSolutionsForAdmin = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(SolutionTranslation);
    const solutions = await repo.find({
      where: { language: "tr" }, // Türkçe olanları getir
      relations: ["solution"],
    });

    const response = solutions.map((item) => ({
      id: item.solution.id,
      slug: item.solution.slug,
      title: item.title,
      description: item.description,
      imageUrl: item.solution.imageUrl,
      hasExtraContent: item.solution.hasExtraContent,
    }));

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Error fetching solutions for admin", error: err });
  }
};

// Admin panel için solution detaylarını getir (düzenleme için)
export const getSolutionForEdit = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const solutionRepo = AppDataSource.getRepository(Solution);
    const solution = await solutionRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["translations"]
    });

    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
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

    res.status(200).json({
      id: solution.id,
      slug: solution.slug,
      imageUrl: solution.imageUrl,
      hasExtraContent: solution.hasExtraContent,
      translations: translations
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching solution for edit", error: err });
  }
};

// Yeni solution oluştur
export const createSolution = async (req: Request, res: Response) => {
  const { 
    slug, 
    imageUrl, 
    hasExtraContent,
    translations 
  } = req.body;

  try {
    // Slug kontrolü
    const existingSolution = await AppDataSource.getRepository(Solution).findOne({
      where: { slug }
    });

    if (existingSolution) {
      return res.status(400).json({ message: "Bu slug zaten kullanılıyor" });
    }

    // Solution oluştur
    const solutionRepo = AppDataSource.getRepository(Solution);
    const solution = solutionRepo.create({
      slug,
      imageUrl,
      hasExtraContent: hasExtraContent || false
    });

    const savedSolution = await solutionRepo.save(solution);

    // Translation'ları oluştur
    if (translations && Array.isArray(translations)) {
      const translationRepo = AppDataSource.getRepository(SolutionTranslation);
      
      for (const translation of translations) {
        const newTranslation = translationRepo.create({
          language: translation.language,
          title: translation.title,
          subtitle: translation.subtitle,
          description: translation.description,
          solution: savedSolution
        });
        
        await translationRepo.save(newTranslation);
      }
    }

    res.status(201).json({
      message: "Solution başarıyla oluşturuldu",
      solution: savedSolution
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating solution", error: err });
  }
};

// Solution güncelle
export const updateSolution = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { slug, imageUrl, hasExtraContent, translations } = req.body;

  try {
    console.log('🔄 Solution güncelleme işlemi başlatıldı, ID:', id);
    
    const solutionRepo = AppDataSource.getRepository(Solution);
    const solution = await solutionRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["translations"]
    });

    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    console.log('🔍 Solution bulundu:', solution.id, solution.slug);

    // Slug kontrolü (kendisi hariç)
    if (slug && slug !== solution.slug) {
      const existingSolution = await solutionRepo.findOne({
        where: { slug }
      });

      if (existingSolution) {
        return res.status(400).json({ message: "Bu slug zaten kullanılıyor" });
      }
    }

    // Eski resmi sil (eğer yeni resim yüklendiyse)
    if (solution.imageUrl && imageUrl && solution.imageUrl !== imageUrl) {
      console.log('🗑️ Eski solution resmi siliniyor:', solution.imageUrl);
      const oldImagePath = getPublicFilePath(solution.imageUrl);
      deleteFileIfExists(oldImagePath);
    }

    // Solution güncelle
    solution.slug = slug || solution.slug;
    solution.imageUrl = imageUrl || solution.imageUrl;
    solution.hasExtraContent = hasExtraContent !== undefined ? hasExtraContent : solution.hasExtraContent;

    await solutionRepo.save(solution);

    // Translation'ları güncelle
    if (translations && Array.isArray(translations)) {
      const translationRepo = AppDataSource.getRepository(SolutionTranslation);
      
      for (const translation of translations) {
        const existingTranslation = await translationRepo.findOne({
          where: {
            solution: { id: parseInt(id) },
            language: translation.language
          }
        });

        if (existingTranslation) {
          // Güncelle
          existingTranslation.title = translation.title;
          existingTranslation.subtitle = translation.subtitle;
          existingTranslation.description = translation.description;
          await translationRepo.save(existingTranslation);
        } else {
          // Yeni oluştur
          const newTranslation = translationRepo.create({
            language: translation.language,
            title: translation.title,
            subtitle: translation.subtitle,
            description: translation.description,
            solution: solution
          });
          await translationRepo.save(newTranslation);
        }
      }
    }

    console.log('✅ Solution başarıyla güncellendi');
    res.status(200).json({
      message: "Solution başarıyla güncellendi",
      solution: solution
    });
  } catch (err) {
    console.error('❌ Solution güncelleme hatası:', err);
    res.status(500).json({ message: "Error updating solution", error: err });
  }
};

// Solution sil
export const deleteSolution = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    console.log('🗑️ Solution silme işlemi başlatıldı, ID:', id);
    
    const solutionRepo = AppDataSource.getRepository(Solution);
    const translationRepo = AppDataSource.getRepository(SolutionTranslation);
    const extraContentRepo = AppDataSource.getRepository(SolutionExtraContent);

    // Solution'ı bul
    const solution = await solutionRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["translations", "extraContents"]
    });

    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    console.log('🔍 Solution bulundu:', solution.id, solution.slug);

    // Ekstra içerik sayısını al
    const extraContentCount = solution.extraContents?.length || 0;
    const translationCount = solution.translations?.length || 0;

    // 1. Önce ekstra içerikleri sil
    if (extraContentCount > 0) {
      console.log('🗑️ Solution ekstra içerikleri siliniyor...');
      await extraContentRepo.delete({
        solution: { id: parseInt(id) }
      });
    }

    // 2. Translation'ları sil
    if (translationCount > 0) {
      console.log('🗑️ Solution translation\'ları siliniyor...');
      await translationRepo.delete({
        solution: { id: parseInt(id) }
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
    await solutionRepo.remove(solution);
    
    console.log('✅ Solution başarıyla silindi');
    res.status(200).json({ 
      message: `Solution başarıyla silindi`,
      deletedItems: {
        solution: 1,
        translations: translationCount,
        extraContents: extraContentCount
      }
    });
  } catch (err) {
    console.error('❌ Solution silme hatası:', err);
    res.status(500).json({ message: "Error deleting solution", error: err });
  }
};
