import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Solution } from "../entity/Solution";
import { SolutionExtraContent } from "../entity/SolutionExtraContent";

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

    // Solution'ın hasExtraContent'ini true yap
    solution.hasExtraContent = true;
    await solutionRepo.save(solution);

    res.status(201).json({
      message: "Extra content added successfully",
      extraContent
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding extra content", error: err });
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

    // Eğer solution'ın başka ekstra içeriği yoksa hasExtraContent'i false yap
    const remainingContents = await repo.count({
      where: { solution: { id: extraContent.solution.id } }
    });

    if (remainingContents === 0) {
      const solutionRepo = AppDataSource.getRepository(Solution);
      const solution = await solutionRepo.findOne({
        where: { id: extraContent.solution.id }
      });
      if (solution) {
        solution.hasExtraContent = false;
        await solutionRepo.save(solution);
      }
    }

    res.status(200).json({ message: "Extra content deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting extra content", error: err });
  }
};