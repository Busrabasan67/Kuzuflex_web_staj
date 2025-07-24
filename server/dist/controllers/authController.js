"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = __importDefault(require("../data-source"));
const Admin_1 = require("../entity/Admin");
/**
 * @swagger
 * /api/auth/admin-login:
 *   post:
 *     summary: Admin girişi yap
 *     tags: [Auth]
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
const login = async (req, res) => {
    const { identifier, password } = req.body;
    const adminRepo = data_source_1.default.getRepository(Admin_1.Admin);
    const admin = await adminRepo.findOneBy([
        { username: identifier },
        { email: identifier },
    ]);
    if (!admin) {
        return res.status(401).json({ message: "Admin bulunamadı" });
    }
    const isPasswordCorrect = await bcrypt_1.default.compare(password, admin.passwordHash);
    if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Şifre yanlış" });
    }
    const token = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email }, "GIZLIANAHTAR", { expiresIn: "1h" });
    return res.json({ message: "Giriş başarılı", token });
};
exports.login = login;
