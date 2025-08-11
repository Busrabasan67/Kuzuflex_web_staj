import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { AboutPage } from "../entity/AboutPage";
import { AboutPageTranslation } from "../entity/AboutPageTranslation";

export const getPageBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const lang = (req.query.lang as string) || 'tr';

  try {
    const pageRepo = AppDataSource.getRepository(AboutPage);
    const page = await pageRepo.findOne({ where: { slug }, relations: ["translations"] });
    if (!page) return res.status(404).json({ message: "Page not found" });

    const translation = page.translations.find(t => t.language === lang) || page.translations[0];
    if (!translation) return res.status(404).json({ message: "Page translation not found" });

    return res.status(200).json({
      id: page.id,
      slug: page.slug,
      heroImageUrl: page.heroImageUrl,
      title: translation.title,
      subtitle: translation.subtitle,
      bodyHtml: translation.bodyHtml,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching page", error: err instanceof Error ? err.message : String(err) });
  }
};

export const getPageWithTranslations = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const pageRepo = AppDataSource.getRepository(AboutPage);
    const page = await pageRepo.findOne({ where: { slug }, relations: ["translations"] });
    if (!page) return res.status(404).json({ message: "Page not found" });

    return res.status(200).json(page);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching page (admin)", error: err instanceof Error ? err.message : String(err) });
  }
};

export const upsertPage = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { heroImageUrl, translations } = req.body as { heroImageUrl?: string; translations: Array<{ language: string; title: string; subtitle?: string; bodyHtml: string; }>; };

  if (!translations || !Array.isArray(translations) || translations.length === 0) {
    return res.status(400).json({ message: "translations is required" });
  }

  try {
    const pageRepo = AppDataSource.getRepository(AboutPage);
    const trRepo = AppDataSource.getRepository(AboutPageTranslation);

    let page = await pageRepo.findOne({ where: { slug }, relations: ["translations"] });
    if (!page) {
      page = pageRepo.create({ slug, heroImageUrl });
      await pageRepo.save(page);
      page.translations = [];
    } else if (heroImageUrl !== undefined) {
      page.heroImageUrl = heroImageUrl;
      await pageRepo.save(page);
    }

    // Upsert translations
    for (const tr of translations) {
      let existing = page.translations?.find(t => t.language === tr.language);
      if (existing) {
        existing.title = tr.title;
        existing.subtitle = tr.subtitle;
        existing.bodyHtml = tr.bodyHtml;
        await trRepo.save(existing);
      } else {
        const newTr = trRepo.create({ language: tr.language, title: tr.title, subtitle: tr.subtitle, bodyHtml: tr.bodyHtml, page });
        await trRepo.save(newTr);
      }
    }

    const updated = await pageRepo.findOne({ where: { slug }, relations: ["translations"] });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Error upserting page", error: err instanceof Error ? err.message : String(err) });
  }
};


