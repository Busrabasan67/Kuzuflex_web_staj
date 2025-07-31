import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Yüklenen dosyaların kaydedileceği dizin
const uploadDir = path.join(__dirname, "../../public/uploads/images/Products");
// Klasör yoksa oluştur
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer ayarları: dosya nereye ve hangi isimle kaydedilecek
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Hedef klasör
  },
  filename: (req, file, cb) => {
    // Dosya adını benzersiz yapmak için zaman damgası ekle
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "productgroup-" + uniqueSuffix + ext);
  },
});

// Sadece resim dosyalarına izin ver
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Sadece resim dosyaları yüklenebilir!"));
  }
};

export const upload = multer({ storage, fileFilter });

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