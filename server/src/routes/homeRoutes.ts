// server/src/routes/homeRoutes.ts
import express from 'express';
import { getHomeData } from '../controllers/homeController';

const router = express.Router();

// Ana sayfa verilerini getir
router.get('/', getHomeData);

export default router;
