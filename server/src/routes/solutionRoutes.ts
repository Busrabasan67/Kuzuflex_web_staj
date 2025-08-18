import express from "express";
import multer from "multer";
import AppDataSource from "../data-source";
import { Solution } from "../entity/Solution";
import { 
  getAllSolutions, 
  getSolutionBySlug, 
  getSolutionsForAdmin,
  getSolutionForEdit,
  createSolution,
  updateSolution,
  deleteSolution
} from "../controllers/solutionController";
import { uploadSolution } from "../controllers/uploadController";

const router = express.Router();

/**
 * @openapi
 * /api/solutions:
 *   get:
 *     summary: Tüm çözümleri listeler
 *     tags: [Solutions]
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

// Çözüm sayısını getiren route (dashboard için)
router.get("/count", async (req, res) => {
  try {
    const solutionRepository = AppDataSource.getRepository(Solution);
    const count = await solutionRepository.count();
    res.json(count);
  } catch (error) {
    console.error('Çözüm sayısı alınamadı:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/solutions:
 *   post:
 *     summary: Yeni çözüm oluşturur (resim yükleme ile birlikte)
 *     tags: [Solutions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Çözüm resmi (opsiyonel)"
 *               data:
 *                 type: string
 *                 description: "JSON formatında çözüm verileri"
 *     responses:
 *       201:
 *         description: "Çözüm başarıyla oluşturuldu"
 */
router.post("/", uploadSolution.single('image'), createSolution);

/**
 * @openapi
 * /api/solutions/admin:
 *   get:
 *     summary: Admin panel için çözümleri listeler
 *     tags: [Solutions]
 *     responses:
 *       200:
 *         description: "Admin için çözüm listesi döner"
 */
router.get("/admin", getSolutionsForAdmin);

/**
 * @openapi
 * /api/solutions/admin/{id}:
 *   get:
 *     summary: Admin panel için çözüm detaylarını getirir (düzenleme için)
 *     tags: [Solutions]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Çözüm ID'si"
 *     responses:
 *       200:
 *         description: "Düzenleme için çözüm detayları döner"
 */
router.get("/admin/:id", getSolutionForEdit);

/**
 * @openapi
 * /api/solutions/{slug}:
 *   get:
 *     summary: Slug'a göre çözüm detayını getirir
 *     tags: [Solutions]
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

/**
 * @openapi
 * /api/solutions/{id}:
 *   put:
 *     summary: Çözümü günceller (resim yükleme ile birlikte)
 *     tags: [Solutions]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Çözüm resmi (opsiyonel)"
 *               data:
 *                 type: string
 *                 description: "JSON formatında çözüm verileri"
 *     responses:
 *       200:
 *         description: "Çözüm başarıyla güncellendi"
 */
router.put("/:id", uploadSolution.single('image'), updateSolution);

/**
 * @openapi
 * /api/solutions/{id}:
 *   delete:
 *     summary: Çözümü siler
 *     tags: [Solutions]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: "Çözüm başarıyla silindi"
 */
router.delete("/:id", deleteSolution);

export default router;
