import { Request, Response } from "express";
import { solutionService } from "../services/solutionService";

export const getAllSolutions = async (req: Request, res: Response) => {
  const lang = req.query.lang as string || "tr";

  try {
    const solutions = await solutionService.getAllSolutions(lang);
    res.status(200).json(solutions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching solutions", error: err instanceof Error ? err.message : String(err) });
  }
};

export const getSolutionBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const lang = req.query.lang as string || "tr";

  try {
    const solution = await solutionService.getSolutionBySlug(slug, lang);
    res.status(200).json(solution);
  } catch (err) {
    res.status(500).json({ message: "Error fetching solution detail", error: err instanceof Error ? err.message : String(err) });
  }
};

// Admin panel için tüm solution'ları getir
export const getSolutionsForAdmin = async (req: Request, res: Response) => {
  try {
    const solutions = await solutionService.getSolutionsForAdmin();
    res.status(200).json(solutions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching solutions for admin", error: err instanceof Error ? err.message : String(err) });
  }
};

// Admin panel için solution detaylarını getir (düzenleme için)
export const getSolutionForEdit = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const solution = await solutionService.getSolutionForEdit(parseInt(id));
    res.status(200).json(solution);
  } catch (err) {
    res.status(500).json({ message: "Error fetching solution for edit", error: err instanceof Error ? err.message : String(err) });
  }
};

// Yeni solution oluştur (resim yükleme ile birlikte)
export const createSolution = async (req: Request, res: Response) => {
  try {
    console.log('CREATE SOLUTION - Request body:', req.body);
    console.log(' CREATE SOLUTION - File:', req.file);
    
    let imageUrl = req.body.imageUrl;
    let solutionData = req.body;

    // Eğer FormData ile resim yüklendiyse
    if (req.file) {
      imageUrl = `/uploads/solutions/${req.file.filename}`;
      console.log('📸 CREATE SOLUTION - Yeni resim yolu:', imageUrl);
      
      // FormData'dan gelen veriyi parse et
      if (req.body.data) {
        solutionData = JSON.parse(req.body.data);
        console.log('📋 CREATE SOLUTION - Parsed data:', solutionData);
      }
    }

    console.log('CREATE SOLUTION - Service çağrısı öncesi:', {
      slug: solutionData.slug,
      imageUrl,
      hasExtraContent: solutionData.hasExtraContent,
      translations: solutionData.translations
    });

    const result = await solutionService.createSolution({
      slug: solutionData.slug,
      imageUrl,
      hasExtraContent: solutionData.hasExtraContent,
      translations: solutionData.translations
    });
    
    console.log('CREATE SOLUTION - Başarılı:', result);
    res.status(201).json(result);
  } catch (err) {
    console.error('CREATE SOLUTION - Hata:', err);
    res.status(500).json({ message: "Error creating solution", error: err instanceof Error ? err.message : String(err) });
  }
};

// Solution güncelle (resim yükleme ile birlikte)
export const updateSolution = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    let imageUrl = req.body.imageUrl;
    let solutionData = req.body;

    // Eğer FormData ile resim yüklendiyse
    if (req.file) {
      imageUrl = `/uploads/solutions/${req.file.filename}`;
      
      // FormData'dan gelen veriyi parse et
      if (req.body.data) {
        solutionData = JSON.parse(req.body.data);
      }
    }

    const result = await solutionService.updateSolution(parseInt(id), {
      slug: solutionData.slug,
      imageUrl,
      hasExtraContent: solutionData.hasExtraContent,
      translations: solutionData.translations
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Error updating solution", error: err instanceof Error ? err.message : String(err) });
  }
};

// Solution sil
export const deleteSolution = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await solutionService.deleteSolution(parseInt(id));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Error deleting solution", error: err instanceof Error ? err.message : String(err) });
  }
};
