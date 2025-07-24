// src/routes/productGroupRoutes.ts
import { Router } from "express";
import { getAllGroups } from "../controllers/productGroupController";

const router = Router();

router.get("/", getAllGroups); // GET /api/product-groups

export default router;
