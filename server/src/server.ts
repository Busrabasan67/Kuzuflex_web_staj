import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppDataSource  from "./data-source"; // AppDataSource burada
import { login } from "./controllers/authController";
import { swaggerUi, swaggerSpec } from "./config/swagger";
import app from "./app"; // app.ts'den gelen uygulamayı import et

import path from "path";

const PORT = 5000;

// 💡 Veritabanı bağlantısı
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Veritabanı bağlantısı başarılı!");

    // Swagger dokümantasyonunu ekle
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Static dosyaları serve et
    app.use("/uploads", express.static("public/uploads"));
    
    // Login route'unu ekle
    app.post("/api/auth/admin-login", login);

    app.listen(PORT, () => {
      console.log(`🚀 Server http://localhost:${PORT} üzerinde çalışıyor`);
    });
  })
  .catch((err) => {
    console.error("❌ Veritabanı bağlantı hatası:", err);
  });

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"))
);