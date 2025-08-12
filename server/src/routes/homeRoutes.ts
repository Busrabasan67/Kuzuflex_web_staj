// server/src/routes/homeRoutes.ts
import express from 'express';
import { getHomeData } from '../controllers/homeController';

const router = express.Router();

/**
 * @swagger
 * /api/home:
 *   get:
 *     summary: Ana sayfa verilerini getir
 *     description: Ana sayfa için gerekli tüm verileri (markets, solutions, productGroups, featuredProducts) tek seferde getirir
 *     tags: [Home]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           default: tr
 *           enum: [tr, en, de, fr]
 *         description: Dil kodu (tr, en, de, fr)
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 markets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       order:
 *                         type: integer
 *                 solutions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       order:
 *                         type: integer
 *                 productGroups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       order:
 *                         type: integer
 *                       subcategories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             slug:
 *                               type: string
 *                             title:
 *                               type: string
 *                             description:
 *                               type: string
 *                             imageUrl:
 *                               type: string
 *                 featuredProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       productGroup:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           slug:
 *                             type: string
 *                           title:
 *                             type: string
 *                       order:
 *                         type: integer
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

// Ana sayfa verilerini getir
router.get('/', getHomeData);

export default router;
