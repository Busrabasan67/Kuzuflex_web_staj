import { Repository } from "typeorm";
import AppDataSource from "../data-source";
import { Solution } from "../entity/Solution";
import { SolutionExtraContent } from "../entity/SolutionExtraContent";
import * as path from "path";
import * as fs from "fs";

class SolutionExtraContentService {
  private extraContentRepository: Repository<SolutionExtraContent>;
  private solutionRepository: Repository<Solution>;

  constructor() {
    this.extraContentRepository = AppDataSource.getRepository(SolutionExtraContent);
    this.solutionRepository = AppDataSource.getRepository(Solution);
  }

  // Solution'ın hasExtraContent alanını güncelle
  private async updateSolutionHasExtraContent(solutionId: number): Promise<void> {
    try {
      // Bu solution için kaç tane ekstra içerik var?
      const extraContentCount = await this.extraContentRepository.count({
        where: { solution: { id: solutionId } }
      });
      
      // Solution'ı bul ve hasExtraContent'i güncelle
      const solution = await this.solutionRepository.findOne({
        where: { id: solutionId }
      });
      
      if (solution) {
        solution.hasExtraContent = extraContentCount > 0;
        await this.solutionRepository.save(solution);
      }
    } catch (error) {
      console.error('Error updating hasExtraContent:', error);
    }
  }

  // Dosya silme yardımcı fonksiyonu
  private deleteFileIfExists(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Dosya silindi: ${filePath}`);
      }
    } catch (error) {
      console.error(`Dosya silinirken hata: ${error}`);
    }
  }

  // Public path oluşturma yardımcı fonksiyonu
  private getPublicFilePath(filename: string): string {
    return path.join(__dirname, "../../public/uploads/solutions/extra-content", filename);
  }

  // Ekstra içerik ekle
  async addExtraContent(solutionId: number, type: string, title: string, content: string, order: number, language: string): Promise<SolutionExtraContent> {
    // Solution'ı bul
    const solution = await this.solutionRepository.findOne({
      where: { id: solutionId }
    });

    if (!solution) {
      throw new Error("Solution not found");
    }

    // Ekstra içerik oluştur
    const extraContent = this.extraContentRepository.create({
      type,
      title,
      content,
      order: order || 1,
      language: language || "tr",
      solution
    });

    const savedContent = await this.extraContentRepository.save(extraContent);

    // Solution'ın hasExtraContent'ini güncelle
    await this.updateSolutionHasExtraContent(solutionId);

    return savedContent;
  }

  // Çoklu dil için ekstra içerik ekle
  async addMultiLanguageExtraContent(solutionId: number, type: string, contents: any[], order: number): Promise<SolutionExtraContent[]> {
    // Solution'ı bul
    const solution = await this.solutionRepository.findOne({
      where: { id: solutionId }
    });

    if (!solution) {
      throw new Error("Solution not found");
    }

    // contents array'i kontrol et
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      throw new Error("Contents array is required");
    }

    // Her dil için ekstra içerik oluştur
    const createdContents = [];

    for (const content of contents) {
      const { language, title, content: contentData } = content;
      
      if (!language || !title || !contentData) {
        throw new Error(`Missing required fields for language: ${language}`);
      }

      const extraContent = this.extraContentRepository.create({
        type,
        title,
        content: contentData,
        order: order || 1,
        language,
        solution
      });

      const savedContent = await this.extraContentRepository.save(extraContent);
      createdContents.push(savedContent);
    }

    // Solution'ın hasExtraContent'ini güncelle
    await this.updateSolutionHasExtraContent(solutionId);

    return createdContents;
  }

  // Solution'ın ekstra içeriklerini getir
  async getExtraContents(solutionId: number, language: string): Promise<SolutionExtraContent[]> {
    const extraContents = await this.extraContentRepository.find({
      where: {
        solution: { id: solutionId },
        language: language || "tr"
      },
      order: { order: "ASC" }
    });

    return extraContents;
  }

  // Admin panel için tüm ekstra içerikleri getir
  async getAllExtraContentsForAdmin(): Promise<any[]> {
    const extraContents = await this.extraContentRepository.find({
      relations: ["solution"],
      order: { order: "ASC" }
    });

    return extraContents.map((content) => ({
      id: content.id,
      type: content.type,
      title: content.title,
      content: content.content,
      order: content.order,
      language: content.language,
      solutionId: content.solution.id,
      solutionTitle: content.solution.slug
    }));
  }

  // Tek bir ekstra içeriği getir (düzenleme için)
  async getExtraContentById(id: number): Promise<SolutionExtraContent> {
    const extraContent = await this.extraContentRepository.findOne({
      where: { id },
      relations: ["solution"]
    });

    if (!extraContent) {
      throw new Error("Extra content not found");
    }

    return extraContent;
  }

  // Ekstra içerik güncelle
  async updateExtraContent(id: number, type: string, title: string, content: string, order: number): Promise<SolutionExtraContent> {
    const extraContent = await this.extraContentRepository.findOne({
      where: { id }
    });

    if (!extraContent) {
      throw new Error("Extra content not found");
    }

    extraContent.type = type || extraContent.type;
    extraContent.title = title || extraContent.title;
    extraContent.content = content || extraContent.content;
    extraContent.order = order || extraContent.order;

    return await this.extraContentRepository.save(extraContent);
  }

  // Grup bazlı ekstra içerik güncelle
  async updateExtraContentGroup(groupId: number, solutionId: number, type: string, contents: any[], order: number): Promise<number> {
    // Önce mevcut grup içeriklerini bul
    const existingContents = await this.extraContentRepository.find({
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
        await this.extraContentRepository.save(existingContent);
      } else {
        // Yeni içerik oluştur
        const newContent = this.extraContentRepository.create({
          solution: { id: solutionId },
          type,
          title,
          content,
          order,
          language
        });
        await this.extraContentRepository.save(newContent);
      }
    }

    // Solution'ın hasExtraContent'ini güncelle
    await this.updateSolutionHasExtraContent(solutionId);

    return contents.length;
  }

  // Ekstra içerik sil
  async deleteExtraContent(id: number): Promise<void> {
    const extraContent = await this.extraContentRepository.findOne({
      where: { id },
      relations: ["solution"]
    });

    if (!extraContent) {
      throw new Error("Extra content not found");
    }

    await this.extraContentRepository.remove(extraContent);

    // Solution'ın hasExtraContent'ini güncelle
    await this.updateSolutionHasExtraContent(extraContent.solution.id);
  }
}

export default new SolutionExtraContentService();
