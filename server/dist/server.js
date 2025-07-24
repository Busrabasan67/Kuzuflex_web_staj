"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = __importDefault(require("./data-source")); // AppDataSource burada
const authController_1 = require("./controllers/authController");
const swagger_1 = require("./config/swagger");
const app = (0, express_1.default)();
const PORT = 5000;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express_1.default.json());
app.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec));
// 💡 Veritabanı bağlantısı
data_source_1.default.initialize()
    .then(() => {
    console.log("✅ Veritabanı bağlantısı başarılı!");
    // 🔁 login route yönlendirmesi
    app.post("/api/auth/admin-login", authController_1.login);
    app.listen(PORT, () => {
        console.log(`🚀 Server http://localhost:${PORT} üzerinde çalışıyor`);
    });
})
    .catch((err) => {
    console.error("❌ Veritabanı bağlantı hatası:", err);
});
