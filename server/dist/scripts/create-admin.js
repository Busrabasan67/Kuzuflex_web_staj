"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/create-admin.ts
const data_source_1 = __importDefault(require("../data-source")); // AppDataSource'ın bulunduğu dosya
const Admin_1 = require("../entity/Admin");
const bcrypt_1 = __importDefault(require("bcrypt"));
const run = async () => {
    await data_source_1.default.initialize();
    const adminRepo = data_source_1.default.getRepository(Admin_1.Admin);
    const username = "admin";
    const email = "admin@example.com";
    const plainPassword = "123456"; // düz şifre burada
    const existing = await adminRepo.findOneBy({ email });
    if (existing) {
        console.log("❗ Zaten bu email ile bir admin var.");
        return;
    }
    const hashedPassword = await bcrypt_1.default.hash(plainPassword, 10); // şifreyi hashle
    const newAdmin = adminRepo.create({
        username,
        email,
        passwordHash: hashedPassword,
    });
    await adminRepo.save(newAdmin);
    console.log("✅ Admin başarıyla kaydedildi.");
    await data_source_1.default.destroy();
};
run().catch((err) => {
    console.error("💥 Hata:", err);
});
