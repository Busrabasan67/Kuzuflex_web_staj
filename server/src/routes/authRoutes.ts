import { Router } from "express";
import { login } from "../controllers/authController";

const router = Router();

router.post("/admin-login", login); // ← /api/auth/admin-login olacak

export default router;
/**
 * @swagger
 * /api/auth/admin-login:
 *   post:
 *     summary: Admin girişi yap
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *       401:
 *         description: Hatalı şifre veya kullanıcı bulunamadı
 */