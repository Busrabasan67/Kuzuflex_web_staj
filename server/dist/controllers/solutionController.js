"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSolution = exports.updateSolution = exports.createSolution = exports.getSolutionForEdit = exports.getSolutionsForAdmin = exports.getSolutionBySlug = exports.getAllSolutions = void 0;
const solutionService_1 = require("../services/solutionService");
const getAllSolutions = async (req, res) => {
    const lang = req.query.lang || "tr";
    try {
        const solutions = await solutionService_1.solutionService.getAllSolutions(lang);
        res.status(200).json(solutions);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching solutions", error: err instanceof Error ? err.message : String(err) });
    }
};
exports.getAllSolutions = getAllSolutions;
const getSolutionBySlug = async (req, res) => {
    const { slug } = req.params;
    const lang = req.query.lang || "tr";
    try {
        const solution = await solutionService_1.solutionService.getSolutionBySlug(slug, lang);
        res.status(200).json(solution);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching solution detail", error: err instanceof Error ? err.message : String(err) });
    }
};
exports.getSolutionBySlug = getSolutionBySlug;
// Admin panel için tüm solution'ları getir
const getSolutionsForAdmin = async (req, res) => {
    try {
        const solutions = await solutionService_1.solutionService.getSolutionsForAdmin();
        res.status(200).json(solutions);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching solutions for admin", error: err instanceof Error ? err.message : String(err) });
    }
};
exports.getSolutionsForAdmin = getSolutionsForAdmin;
// Admin panel için solution detaylarını getir (düzenleme için)
const getSolutionForEdit = async (req, res) => {
    const { id } = req.params;
    try {
        const solution = await solutionService_1.solutionService.getSolutionForEdit(parseInt(id));
        res.status(200).json(solution);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching solution for edit", error: err instanceof Error ? err.message : String(err) });
    }
};
exports.getSolutionForEdit = getSolutionForEdit;
// Yeni solution oluştur (resim yükleme ile birlikte)
const createSolution = async (req, res) => {
    try {
        console.log('🔍 CREATE SOLUTION - Request body:', req.body);
        console.log('🔍 CREATE SOLUTION - File:', req.file);
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
        console.log('🚀 CREATE SOLUTION - Service çağrısı öncesi:', {
            slug: solutionData.slug,
            imageUrl,
            hasExtraContent: solutionData.hasExtraContent,
            translations: solutionData.translations
        });
        const result = await solutionService_1.solutionService.createSolution({
            slug: solutionData.slug,
            imageUrl,
            hasExtraContent: solutionData.hasExtraContent,
            translations: solutionData.translations
        });
        console.log('✅ CREATE SOLUTION - Başarılı:', result);
        res.status(201).json(result);
    }
    catch (err) {
        console.error('❌ CREATE SOLUTION - Hata:', err);
        res.status(500).json({ message: "Error creating solution", error: err instanceof Error ? err.message : String(err) });
    }
};
exports.createSolution = createSolution;
// Solution güncelle (resim yükleme ile birlikte)
const updateSolution = async (req, res) => {
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
        const result = await solutionService_1.solutionService.updateSolution(parseInt(id), {
            slug: solutionData.slug,
            imageUrl,
            hasExtraContent: solutionData.hasExtraContent,
            translations: solutionData.translations
        });
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: "Error updating solution", error: err instanceof Error ? err.message : String(err) });
    }
};
exports.updateSolution = updateSolution;
// Solution sil
const deleteSolution = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await solutionService_1.solutionService.deleteSolution(parseInt(id));
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting solution", error: err instanceof Error ? err.message : String(err) });
    }
};
exports.deleteSolution = deleteSolution;
