import express from "express";
import { getPageBySlug, getPageWithTranslations, upsertPage } from "../controllers/pageController";

const router = express.Router();

// Public GET
router.get("/:slug", getPageBySlug);

// Admin GET (with translations)
router.get("/admin/:slug", getPageWithTranslations);

// Admin UPSERT
router.put("/:slug", upsertPage);

export default router;


