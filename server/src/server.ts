import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppDataSource  from "./data-source"; // AppDataSource burada
import { login } from "./controllers/authController";
import { swaggerUi, swaggerSpec } from "./config/swagger";

import productGroupRoutes from "./routes/ProductGroupRoutes";

const app = express();
const PORT = 5000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 💡 Veritabanı bağlantısı
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Veritabanı bağlantısı başarılı!");

    // ✅ BURAYA EKLE:
    app.use("/api/product-groups", productGroupRoutes); // 🔁 grup endpointler

    // 🔁 login route yönlendirmesi
    app.post("/api/auth/admin-login", login);

    app.listen(PORT, () => {
      console.log(`🚀 Server http://localhost:${PORT} üzerinde çalışıyor`);
    });
  })
  .catch((err) => {
    console.error("❌ Veritabanı bağlantı hatası:", err);
  });