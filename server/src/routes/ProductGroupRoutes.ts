import { Router } from "express";
import { getAllGroups, getProductsByGroupId } from "../controllers/productGroupController";

const router = Router();

/**
 * @swagger
 * /api/product-groups:
 *   get:
 *     summary: Tüm ürün gruplarını getir
 *     tags: [ProductGroups]
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get("/", getAllGroups); // ✅ Yorum hemen üstünde!

/**
 * @swagger
 * /api/product-groups/{groupId}/products:
 *   get:
 *     summary: Belirli bir grubun ürünlerini getir
 *     tags: [ProductGroups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grup ID'si
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *         description: Dil (tr, en, vs)
 *     responses:
 *       200:
 *         description: Ürünler alındı
 */
router.get("/:groupId/products", getProductsByGroupId);

export default router;
