import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Upload dizinini oluştur
const uploadDir = "public/uploads/extra-content";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "image-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Sadece resim dosyaları yüklenebilir!"));
    }
  },
});

// Resim yükleme
export const uploadImage = async (req: Request, res: Response) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "Dosya seçilmedi" });
    }
    
    const imageUrl = `/uploads/extra-content/${req.file.filename}`;
    res.status(200).json({
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  });
};

// Resim silme
export const deleteImage = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: "Resim başarıyla silindi" });
    } else {
      res.status(404).json({ error: "Dosya bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ error: "Dosya silme hatası" });
  }
};