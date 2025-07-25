import express from "express";

import { getSubProduct } from "../controllers/productController";


const router = express.Router();

// Alt ürün verisi getiren route
router.get("/", getSubProduct);

export default router;
