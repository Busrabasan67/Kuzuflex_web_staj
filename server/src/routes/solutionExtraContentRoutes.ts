import express from "express";
import { 
  addExtraContent, 
  getExtraContents, 
  updateExtraContent, 
  deleteExtraContent 
} from "../controllers/solutionExtraContentController";

const router = express.Router();

/**
 * @openapi
 * /api/solution-extra-content:
 *   post:
 *     summary: Solution'a ekstra içerik ekler
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
 * /api/solution-extra-content/{solutionId}:
 *   get:
 *     summary: Solution'ın ekstra içeriklerini getirir
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
 * /api/solution-extra-content/{id}:
 *   put:
 *     summary: Ekstra içeriği günceller
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

export default router;