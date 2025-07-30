import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Solution } from "../entity/Solution";
import { SolutionExtraContent } from "../entity/SolutionExtraContent";

// Solution'ın hasExtraContent alanını güncelle
const updateSolutionHasExtraContent = async (solutionId: number) => {
  try {
    const extraContentRepo = AppDataSource.getRepository(SolutionExtraContent);
    const solutionRepo = AppDataSource.getRepository(Solution);
    
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
  } catch (error) {
    console.error('Error updating hasExtraContent:', error);
  }
};

// Ekstra içerik ekle
export const addExtraContent = async (req: Request, res: Response) => {
  const { solutionId, type, title, content, order, language } = req.body;

  try {
    // Solution'ı bul
    const solutionRepo = AppDataSource.getRepository(Solution);
    const solution = await solutionRepo.findOne({
      where: { id: solutionId }
    });

    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    // Ekstra içerik oluştur
    const extraContentRepo = AppDataSource.getRepository(SolutionExtraContent);
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
  } catch (err) {
    res.status(500).json({ message: "Error adding extra content", error: err });
  }
};

// Çoklu dil için ekstra içerik ekle
export const addMultiLanguageExtraContent = async (req: Request, res: Response) => {
  const { solutionId, type, contents, order } = req.body;

  try {
    // Solution'ı bul
    const solutionRepo = AppDataSource.getRepository(Solution);
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
    const extraContentRepo = AppDataSource.getRepository(SolutionExtraContent);
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
  } catch (err) {
    res.status(500).json({ message: "Error adding multi-language extra content", error: err });
  }
};

// Solution'ın ekstra içeriklerini getir
export const getExtraContents = async (req: Request, res: Response) => {
  const { solutionId } = req.params;
  const { language } = req.query;

  try {
    const repo = AppDataSource.getRepository(SolutionExtraContent);
    const extraContents = await repo.find({
      where: {
        solution: { id: parseInt(solutionId) },
        language: (language as string) || "tr"
      },
      order: { order: "ASC" }
    });

    res.status(200).json(extraContents);
  } catch (err) {
    res.status(500).json({ message: "Error fetching extra contents", error: err });
  }
};

// Admin panel için tüm ekstra içerikleri getir
export const getAllExtraContentsForAdmin = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(SolutionExtraContent);
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
  } catch (err) {
    res.status(500).json({ message: "Error fetching all extra contents", error: err });
  }
};

// Tek bir ekstra içeriği getir (düzenleme için)
export const getExtraContentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const repo = AppDataSource.getRepository(SolutionExtraContent);
    const extraContent = await repo.findOne({
      where: { id: parseInt(id) },
      relations: ["solution"]
    });

    if (!extraContent) {
      return res.status(404).json({ message: "Extra content not found" });
    }

    res.status(200).json(extraContent);
  } catch (err) {
    res.status(500).json({ message: "Error fetching extra content", error: err });
  }
};

// Ekstra içerik güncelle
export const updateExtraContent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, title, content, order } = req.body;

  try {
    const repo = AppDataSource.getRepository(SolutionExtraContent);
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
  } catch (err) {
    res.status(500).json({ message: "Error updating extra content", error: err });
  }
};

// Ekstra içerik sil
export const deleteExtraContent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const repo = AppDataSource.getRepository(SolutionExtraContent);
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
  } catch (err) {
    res.status(500).json({ message: "Error deleting extra content", error: err });
  }
};