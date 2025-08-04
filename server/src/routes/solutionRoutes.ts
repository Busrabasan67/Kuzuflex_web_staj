import express from "express";
import { 
  getAllSolutions, 
  getSolutionBySlug, 
  getSolutionsForAdmin,
  getSolutionForEdit,
  createSolution,
  updateSolution,
  deleteSolution
} from "../controllers/solutionController";

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

/**
 * @openapi
 * /api/solutions:
 *   post:
 *     summary: Yeni çözüm oluşturur
 *     tags: [Solutions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 description: "URL için slug"
 *               imageUrl:
 *                 type: string
 *                 description: "Çözüm resmi URL'i"
 *               hasExtraContent:
 *                 type: boolean
 *                 description: "Ekstra içerik var mı?"
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                     title:
 *                       type: string
 *                     subtitle:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: "Çözüm başarıyla oluşturuldu"
 */
router.post("/", createSolution);

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
 *     summary: Çözümü günceller
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               hasExtraContent:
 *                 type: boolean
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: "Çözüm başarıyla güncellendi"
 */
router.put("/:id", updateSolution);

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
