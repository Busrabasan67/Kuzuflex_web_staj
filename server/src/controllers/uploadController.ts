import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ana upload klasörü
const BASE_UPLOAD_DIR = path.join(__dirname, "../../public/uploads");

// ProductGroup için storage
const productGroupStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(BASE_UPLOAD_DIR, "images/Products");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-group-${uniqueSuffix}${ext}`);
  }
});

// Solution için storage
const solutionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(BASE_UPLOAD_DIR, "solutions");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `solution-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Sadece resim dosyaları yüklenebilir!"));
};

// ProductGroup için upload middleware
export const uploadProductGroup = multer({ storage: productGroupStorage, fileFilter });

// Solution için upload middleware
export const uploadSolution = multer({ storage: solutionStorage, fileFilter });

// Genel upload middleware (varsayılan)
export const upload = multer({ storage: productGroupStorage, fileFilter });

// Dinamik upload middleware (farklı türler için)
export const uploadImage = (req: Request, res: Response) => {
  const type = req.params.type || "other";
  
  const dynamicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      let folder = "other";
      if (type === "product-group") folder = "images/Products";
      else if (type === "solution") folder = "solutions";
      else if (type === "product") folder = "images/Products"; // Alt ürünler için
      const uploadDir = path.join(BASE_UPLOAD_DIR, folder);
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${type}-${uniqueSuffix}${ext}`);
    },
  });

  const dynamicUpload = multer({ storage: dynamicStorage, fileFilter }).single("image");

  dynamicUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "Dosya seçilmedi" });

    let folder = "other";
    if (type === "product-group") folder = "images/Products";
    else if (type === "solution") folder = "solutions";
    else if (type === "product") folder = "images/Products"; // Alt ürünler için

    const imageUrl = `/uploads/${folder}/${req.file.filename}`;
    const fullPath = `uploads/${folder}/${req.file.filename}`;
    res.status(200).json({ 
      url: imageUrl, 
      filename: fullPath, // Tam yolu döndür (veritabanı için)
      originalFilename: req.file.filename, // Sadece dosya adı
      size: req.file.size 
    });
  });
};
