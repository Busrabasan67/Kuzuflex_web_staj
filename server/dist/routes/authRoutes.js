"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post("/admin-login", authController_1.login); // ← /api/auth/admin-login olacak
exports.default = router;
