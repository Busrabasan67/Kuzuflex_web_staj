"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = __importDefault(require("../data-source"));
const Solution_1 = require("../entity/Solution");
const solutionController_1 = require("../controllers/solutionController");
const uploadController_1 = require("../controllers/uploadController");
const router = express_1.default.Router();
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
router.get("/", solutionController_1.getAllSolutions);
// Çözüm sayısını getiren route (dashboard için)
router.get("/count", async (req, res) => {
    try {
        const solutionRepository = data_source_1.default.getRepository(Solution_1.Solution);
        const count = await solutionRepository.count();
        res.json(count);
    }
    catch (error) {
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
router.post("/", uploadController_1.uploadSolution.single('image'), solutionController_1.createSolution);
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
router.get("/admin", solutionController_1.getSolutionsForAdmin);
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
router.get("/admin/:id", solutionController_1.getSolutionForEdit);
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
router.get("/:slug", solutionController_1.getSolutionBySlug);
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
router.put("/:id", uploadController_1.uploadSolution.single('image'), solutionController_1.updateSolution);
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
router.delete("/:id", solutionController_1.deleteSolution);
exports.default = router;
