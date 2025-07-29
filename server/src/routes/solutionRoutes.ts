import express from "express";
import { getAllSolutions, getSolutionBySlug } from "../controllers/solutionController";

const router = express.Router();

/**
 * @openapi
 * /api/solutions:
 *   get:
 *     summary: Tüm çözümleri listeler
 *     parameters:
 *       - name: lang
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: "İstenen dil (tr, en, fr, de)"
 *     responses:
 *       200:
 *         description: "Çözüm listesi döner"
 */
router.get("/", getAllSolutions);

/**
 * @openapi
 * /api/solutions/{slug}:
 *   get:
 *     summary: Slug'a göre çözüm detayını getirir
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: "Çözüm slug'ı (örn: welding)"
 *       - name: lang
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: "Çeviri dili (varsayılan: tr)"
 *     responses:
 *       200:
 *         description: "Çözüm detayı döner"
 */
router.get("/:slug", getSolutionBySlug);

export default router;
