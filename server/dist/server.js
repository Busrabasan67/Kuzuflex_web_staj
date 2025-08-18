"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = __importDefault(require("./data-source")); // AppDataSource burada
const authController_1 = require("./controllers/authController");
const swagger_1 = require("./config/swagger");
const app_1 = __importDefault(require("./app")); // app.ts'den gelen uygulamayı import et
const path_1 = __importDefault(require("path"));
const PORT = 5000;
// 💡 Veritabanı bağlantısı
data_source_1.default.initialize()
    .then(() => {
    console.log("✅ Veritabanı bağlantısı başarılı!");
    // Swagger dokümantasyonunu ekle
    app_1.default.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec));
    // Static dosyaları serve et
    app_1.default.use("/uploads", express_1.default.static("public/uploads"));
    // Login route'unu ekle
    app_1.default.post("/api/auth/admin-login", authController_1.login);
    app_1.default.listen(PORT, () => {
        console.log(`🚀 Server http://localhost:${PORT} üzerinde çalışıyor`);
    });
})
    .catch((err) => {
    console.error("❌ Veritabanı bağlantı hatası:", err);
});
app_1.default.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "..", "public", "uploads")));
