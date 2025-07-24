"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/create-second-admin.ts
const data_source_1 = __importDefault(require("../data-source"));
const Admin_1 = require("../entity/Admin");
const bcrypt_1 = __importDefault(require("bcrypt"));
const main = async () => {
    await data_source_1.default.initialize();
    const repo = data_source_1.default.getRepository(Admin_1.Admin);
    const hashed = await bcrypt_1.default.hash("yeniSifre123", 10);
    const newAdmin = repo.create({
        username: "admin2",
        email: "admin2@example.com",
        passwordHash: hashed,
    });
    await repo.save(newAdmin);
    console.log("✅ İkinci admin başarıyla eklendi!");
    await data_source_1.default.destroy();
};
main().catch(console.error);
