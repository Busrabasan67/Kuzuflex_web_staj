import { Router } from "express";
import { 
  getAllMarkets, 
  getMarketBySlug, 
  getMarketById,
  createMarket, 
  updateMarket, 
  deleteMarket,
  createMarketContent,
  updateMarketContent,
  deleteMarketContent,
  getMarketContents,
  getAvailableProductGroups,
  getAvailableSolutions,
  clearMarketContents
} from "../controllers/marketController";
import { uploadMarket } from "../controllers/uploadController";


/**
 * @swagger
 * components:
 *   schemas:
 *     Market:
 *       type: object
 *       required:
 *         - slug
 *       properties:
 *         id:
 *           type: integer
 *           description: Market ID
 *         slug:
 *           type: string
 *           description: Market slug (URL friendly)
 *         imageUrl:
 *           type: string
 *           description: Market image URL
 *         order:
 *           type: integer
 *           description: Display order
 *         isActive:
 *           type: boolean
 *           description: Market active status
 *         hasProducts:
 *           type: boolean
 *           description: Has products flag
 *         hasSolutions:
 *           type: boolean
 *           description: Has solutions flag
 *         hasCertificates:
 *           type: boolean
 *           description: Has certificates flag
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MarketTranslation'
 *         contents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MarketContent'
 *     
 *     MarketTranslation:
 *       type: object
 *       required:
 *         - language
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: Translation ID
 *         language:
 *           type: string
 *           description: Language code (tr, en, fr, de)
 *         name:
 *           type: string
 *           description: Market name
 *         description:
 *           type: string
 *           description: Market description
 *     
 *     MarketContent:
 *       type: object
 *       required:
 *         - type
 *         - level
 *       properties:
 *         id:
 *           type: integer
 *           description: Content ID
 *         type:
 *           type: string
 *           enum: [product, solution, certificate, contact, about]
 *           description: Content type
 *         level:
 *           type: string
 *           enum: [main, sub]
 *           description: Content level
 *         name:
 *           type: string
 *           description: Button text (for static buttons)
 *         targetUrl:
 *           type: string
 *           description: Target URL
 *         productGroupId:
 *           type: integer
 *           description: ProductGroup reference
 *         productId:
 *           type: integer
 *           description: Product reference
 *         order:
 *           type: integer
 *           description: Display order
 */

const router = Router();

/**
 * @swagger
 * /api/markets:
 *   get:
 *     summary: Get all markets
 *     tags: [Markets]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, fr, de]
 *         description: Language code for translations
 *     responses:
 *       200:
 *         description: List of markets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Market'
 */
router.get("/", getAllMarkets);

/**
 * @swagger
 * /api/markets/id/{id}:
 *   get:
 *     summary: Get market by ID
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Market ID
 *     responses:
 *       200:
 *         description: Market details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Market'
 *       404:
 *         description: Market not found
 */
router.get("/id/:id", getMarketById);
router.get("/:marketId/contents", getMarketContents);

/**
 * @swagger
 * /api/markets/{slug}:
 *   get:
 *     summary: Get market by slug
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Market slug
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, fr, de]
 *         description: Language code for translations
 *     responses:
 *       200:
 *         description: Market details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Market'
 *       404:
 *         description: Market not found
 */
router.get("/:slug", getMarketBySlug);

/**
 * @swagger
 * /api/markets:
 *   post:
 *     summary: Create a new market
 *     tags: [Markets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Market slug
 *               imageUrl:
 *                 type: string
 *                 description: Market image URL
 *               order:
 *                 type: integer
 *                 description: Display order
 *               hasProducts:
 *                 type: boolean
 *                 description: Has products flag
 *               hasSolutions:
 *                 type: boolean
 *                 description: Has solutions flag
 *               hasCertificates:
 *                 type: boolean
 *                 description: Has certificates flag
 *               translations:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MarketTranslation'
 *     responses:
 *       201:
 *         description: Market created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Market'
 */
router.post("/", uploadMarket.single("image"), createMarket);

/**
 * @swagger
 * /api/markets/{id}:
 *   put:
 *     summary: Update a market
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Market ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Market slug
 *               imageUrl:
 *                 type: string
 *                 description: Market image URL
 *               order:
 *                 type: integer
 *                 description: Display order
 *               hasProducts:
 *                 type: boolean
 *                 description: Has products flag
 *               hasSolutions:
 *                 type: boolean
 *                 description: Has solutions flag
 *               hasCertificates:
 *                 type: boolean
 *                 description: Has certificates flag
 *               translations:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MarketTranslation'
 *     responses:
 *       200:
 *         description: Market updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Market'
 *       404:
 *         description: Market not found
 */
router.put("/:id", uploadMarket.single("image"), updateMarket);

/**
 * @swagger
 * /api/markets/{id}:
 *   delete:
 *     summary: Delete a market
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Market ID
 *     responses:
 *       200:
 *         description: Market deleted successfully
 *       404:
 *         description: Market not found
 */
router.delete("/:id", deleteMarket);

/**
 * @swagger
 * /api/markets/{marketId}/contents:
 *   post:
 *     summary: Add content to a market
 *     tags: [Market Contents]
 *     parameters:
 *       - in: path
 *         name: marketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Market ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - level
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [product, solution, certificate, contact, about]
 *                 description: Content type
 *               level:
 *                 type: string
 *                 enum: [main, sub]
 *                 description: Content level
 *               name:
 *                 type: string
 *                 description: Button text (for static buttons)
 *               targetUrl:
 *                 type: string
 *                 description: Target URL
 *               productGroupId:
 *                 type: integer
 *                 description: ProductGroup reference
 *               productId:
 *                 type: integer
 *                 description: Product reference
 *               order:
 *                 type: integer
 *                 description: Display order
 *     responses:
 *       201:
 *         description: Content added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketContent'
 *       404:
 *         description: Market not found
 */
router.post("/:marketId/contents", createMarketContent);

/**
 * @swagger
 * /api/markets/contents/{id}:
 *   put:
 *     summary: Update market content
 *     tags: [Market Contents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [product, solution, certificate, contact, about]
 *                 description: Content type
 *               level:
 *                 type: string
 *                 enum: [main, sub]
 *                 description: Content level
 *               name:
 *                 type: string
 *                 description: Button text (for static buttons)
 *               targetUrl:
 *                 type: string
 *                 description: Target URL
 *               productGroupId:
 *                 type: integer
 *                 description: ProductGroup reference
 *               productId:
 *                 type: integer
 *                 description: Product reference
 *               order:
 *                 type: integer
 *                 description: Display order
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketContent'
 *       404:
 *         description: Content not found
 */
router.put("/contents/:id", updateMarketContent);

/**
 * @swagger
 * /api/markets/contents/{id}:
 *   delete:
 *     summary: Delete market content
 *     tags: [Market Contents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       404:
 *         description: Content not found
 */
router.delete("/contents/:id", deleteMarketContent);

/**
 * @swagger
 * /api/markets/available/product-groups:
 *   get:
 *     summary: Get available product groups for market content
 *     tags: [Markets]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, fr, de]
 *         description: Language code for translations
 *     responses:
 *       200:
 *         description: List of available product groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   slug:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 */
router.get("/available/product-groups", getAvailableProductGroups);

/**
 * @swagger
 * /api/markets/available/solutions:
 *   get:
 *     summary: Get available solutions for market content
 *     tags: [Markets]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, fr, de]
 *         description: Language code for translations
 *     responses:
 *       200:
 *         description: List of available solutions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   slug:
 *                     type: string
 *                   title:
 *                     type: string
 *                   subtitle:
 *                     type: string
 *                   description:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 */
router.get("/available/solutions", getAvailableSolutions);



/**
 * @swagger
 * /api/markets/{marketId}/contents/clear:
 *   delete:
 *     summary: Clear all contents of a market
 *     tags: [Market Contents]
 *     parameters:
 *       - in: path
 *         name: marketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Market ID
 *     responses:
 *       200:
 *         description: Market contents cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 *       404:
 *         description: Market not found
 */
router.delete("/:marketId/contents/clear", clearMarketContents);

export default router; 