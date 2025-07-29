import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { SolutionTranslation } from "../entity/SolutionTranslation";
import { SolutionExtraContent } from "../entity/SolutionExtraContent";

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
      extraContents,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching solution detail", error: err });
  }
};
