import express from "express";
import { 
  addExtraContent, 
  addMultiLanguageExtraContent,
  getExtraContents, 
  getAllExtraContentsForAdmin,
  getExtraContentById,
  updateExtraContent,
  updateExtraContentGroup,
  deleteExtraContent,
  uploadImage,
  uploadExtraContentImage
} from "../controllers/solutionExtraContentController";

const router = express.Router();

/**
 * @openapi
 * /api/solution-extra-content:
 *   post:
 *     summary: Solution'a ekstra içerik ekler
 *     tags: [Solution Extra Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               solutionId:
 *                 type: integer
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               order:
 *                 type: integer
 *               language:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Ekstra içerik başarıyla eklendi"
 */
router.post("/", addExtraContent);

/**
 * @openapi
 * /api/solution-extra-content/multi:
 *   post:
 *     summary: Solution'a çoklu dil ekstra içerik ekler
 *     tags: [Solution Extra Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               solutionId:
 *                 type: integer
 *               type:
 *                 type: string
 *               contents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: "Çoklu dil ekstra içerik başarıyla eklendi"
 */
router.post("/multi", addMultiLanguageExtraContent);

/**
 * @openapi
 * /api/solution-extra-content/admin:
 *   get:
 *     summary: Admin panel için tüm ekstra içerikleri listeler
 *     tags: [Solution Extra Content]
 *     responses:
 *       200:
 *         description: "Tüm ekstra içerikler listesi"
 */
router.get("/admin", getAllExtraContentsForAdmin);

/**
 * @openapi
 * /api/solution-extra-content/{solutionId}:
 *   get:
 *     summary: Solution'ın ekstra içeriklerini getirir
 *     tags: [Solution Extra Content]
 *     parameters:
 *       - name: solutionId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: language
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Ekstra içerikler listesi"
 */
router.get("/:solutionId", getExtraContents);

/**
 * @openapi
 * /api/solution-extra-content/detail/{id}:
 *   get:
 *     summary: Tek bir ekstra içeriği getirir
 *     tags: [Solution Extra Content]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: "Ekstra içerik detayı"
 */
router.get("/detail/:id", getExtraContentById);

/**
 * @openapi
 * /api/solution-extra-content/update-group:
 *   put:
 *     summary: Grup bazlı ekstra içerikleri günceller
 *     tags: [Solution Extra Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *               solutionId:
 *                 type: integer
 *               type:
 *                 type: string
 *               contents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: "Grup ekstra içerikleri başarıyla güncellendi"
 */
router.put("/update-group", updateExtraContentGroup);

/**
 * @openapi
 * /api/solution-extra-content/{id}:
 *   put:
 *     summary: Ekstra içeriği günceller
 *     tags: [Solution Extra Content]
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
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: "Ekstra içerik başarıyla güncellendi"
 */
router.put("/:id", updateExtraContent);

/**
 * @openapi
 * /api/solution-extra-content/{id}:
 *   delete:
 *     summary: Ekstra içeriği siler
 *     tags: [Solution Extra Content]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: "Ekstra içerik başarıyla silindi"
 */
router.delete("/:id", deleteExtraContent);

// Basit resim upload endpoint'i
router.post("/upload", uploadExtraContentImage.single('image'), uploadImage);

export default router;