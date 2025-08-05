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

// Market için storage
const marketStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(BASE_UPLOAD_DIR, "images/Markets");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `market-${uniqueSuffix}${ext}`);
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

// Market için upload middleware
export const uploadMarket = multer({ storage: marketStorage, fileFilter });

// QM Documents için storage
const qmDocumentsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { language = 'tr', documentType = 'images' } = req.params;
    const uploadDir = path.join(BASE_UPLOAD_DIR, `qm-documents-and-certificates/${documentType}/${language}`);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `qm-doc-${uniqueSuffix}${ext}`);
  }
});

// QM Documents için upload middleware
export const uploadQMDocuments = multer({ storage: qmDocumentsStorage, fileFilter });

// Genel upload middleware (varsayılan)
export const upload = multer({ storage: productGroupStorage, fileFilter });

// QM Documents için upload endpoint
export const uploadQMDocumentsFile = (req: Request, res: Response) => {
  try {
    console.log('=== UPLOAD REQUEST START ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);

    // URL'den parametreleri al
    const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
    const documentType = urlParams.get('documentType') || 'document';
    const language = urlParams.get('language') || 'en';
    const fileType = urlParams.get('fileType') || 'image';

    console.log('Extracted parameters from URL:', { documentType, language, fileType });

    const qmDocumentsStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(BASE_UPLOAD_DIR, `qm-documents-and-certificates/${fileType === 'image' ? 'images' : 'pdfs'}/${language}`);
        console.log('Creating upload directory:', uploadDir);
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const filename = `qm-doc-${uniqueSuffix}${ext}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
      },
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      console.log('File filter check:', {
        fileType,
        mimetype: file.mimetype,
        originalname: file.originalname
      });
      
      if (fileType === 'pdf') {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error("Sadece PDF dosyaları yüklenebilir!"));
      } else if (fileType === 'image') {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Sadece resim dosyaları yüklenebilir!"));
      } else {
        cb(new Error("Geçersiz dosya tipi!"));
      }
    };

    const qmDocumentsUpload = multer({ 
      storage: qmDocumentsStorage, 
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      }
    }).single("file");

    qmDocumentsUpload(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
      }
      
      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: "Dosya seçilmedi" });
      }

      console.log('File uploaded successfully:', {
        filename: req.file.filename,
        size: req.file.size,
        path: req.file.path
      });

      const fileUrl = `/uploads/qm-documents-and-certificates/${fileType === 'image' ? 'images' : 'pdfs'}/${language}/${req.file.filename}`;
      const fullPath = `uploads/qm-documents-and-certificates/${fileType === 'image' ? 'images' : 'pdfs'}/${language}/${req.file.filename}`;
      
      console.log('Response data:', { fileUrl, fullPath });
      console.log('=== UPLOAD REQUEST END ===');
      
      res.status(200).json({ 
        url: fileUrl, 
        fullPath: fullPath,
        originalFilename: req.file.filename,
        size: req.file.size,
        language: language,
        documentType: documentType
      });
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Market upload endpoint
export const uploadMarketImage = (req: Request, res: Response) => {
  uploadMarket.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "Dosya seçilmedi" });

    const imageUrl = `/uploads/images/Markets/${req.file.filename}`;
    const fullPath = `uploads/images/Markets/${req.file.filename}`;
    
    res.status(200).json({ 
      url: imageUrl, 
      filename: fullPath, // Tam yolu döndür (veritabanı için)
      originalFilename: req.file.filename, // Sadece dosya adı
      size: req.file.size 
    });
  });
};

// Dinamik upload middleware (farklı türler için)
export const uploadImage = (req: Request, res: Response) => {
  console.log('🔄 Upload Image Request:', {
    type: req.params.type,
    id: req.params.id,
    url: req.url,
    method: req.method
  });
  
  const type = req.params.type || "other";
  
  const dynamicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      let folder = "other";
      if (type === "product-group") folder = "images/Products";
      else if (type === "solution") folder = "solutions";
      else if (type === "product") folder = "images/Products"; // Alt ürünler için
      else if (type === "market") folder = "images/Markets"; // Market için
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
    console.log('📁 Dynamic Upload Callback:', { err: err?.message, file: req.file?.filename });
    
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "Dosya seçilmedi" });

    let folder = "other";
    if (type === "product-group") folder = "images/Products";
    else if (type === "solution") folder = "solutions";
    else if (type === "product") folder = "images/Products"; // Alt ürünler için
    else if (type === "market") folder = "images/Markets"; // Market için

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
