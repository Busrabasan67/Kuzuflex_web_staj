"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadQMDocumentsFile = exports.uploadPage = exports.upload = exports.uploadQMDocuments = exports.uploadMarket = exports.uploadSolution = exports.uploadProductGroup = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ana upload klasörü
const BASE_UPLOAD_DIR = path_1.default.join(__dirname, "../../public/uploads");
// ProductGroup için storage
const productGroupStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(BASE_UPLOAD_DIR, "images/Products");
        if (!fs_1.default.existsSync(uploadDir))
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `product-group-${uniqueSuffix}${ext}`);
    }
});
// Solution için storage
const solutionStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(BASE_UPLOAD_DIR, "solutions");
        if (!fs_1.default.existsSync(uploadDir))
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `solution-${uniqueSuffix}${ext}`);
    }
});
// Market için storage
const marketStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(BASE_UPLOAD_DIR, "images/Markets");
        if (!fs_1.default.existsSync(uploadDir))
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `market-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/"))
        cb(null, true);
    else
        cb(new Error("Sadece resim dosyaları yüklenebilir!"));
};
// ProductGroup için upload middleware
exports.uploadProductGroup = (0, multer_1.default)({ storage: productGroupStorage, fileFilter });
// Solution için upload middleware
exports.uploadSolution = (0, multer_1.default)({ storage: solutionStorage, fileFilter });
// Market için upload middleware
exports.uploadMarket = (0, multer_1.default)({ storage: marketStorage, fileFilter });
// QM Documents için storage
const qmDocumentsStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const { language = 'tr', documentType = 'images' } = req.params;
        const uploadDir = path_1.default.join(BASE_UPLOAD_DIR, `qm-documents-and-certificates/${documentType}/${language}`);
        if (!fs_1.default.existsSync(uploadDir))
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `qm-doc-${uniqueSuffix}${ext}`);
    }
});
// QM Documents için upload middleware
exports.uploadQMDocuments = (0, multer_1.default)({ storage: qmDocumentsStorage, fileFilter });
// Genel upload middleware (varsayılan)
exports.upload = (0, multer_1.default)({ storage: productGroupStorage, fileFilter });
// Pages (About vs.) için storage
const pageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(BASE_UPLOAD_DIR, "images/Pages");
        if (!fs_1.default.existsSync(uploadDir))
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `page-${uniqueSuffix}${ext}`);
    }
});
exports.uploadPage = (0, multer_1.default)({ storage: pageStorage, fileFilter });
// QM Documents için upload endpoint
const uploadQMDocumentsFile = (req, res) => {
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
        const qmDocumentsStorage = multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = path_1.default.join(BASE_UPLOAD_DIR, `qm-documents-and-certificates/${fileType === 'image' ? 'images' : 'pdfs'}/${language}`);
                console.log('Creating upload directory:', uploadDir);
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const ext = path_1.default.extname(file.originalname);
                const filename = `qm-doc-${uniqueSuffix}${ext}`;
                console.log('Generated filename:', filename);
                cb(null, filename);
            },
        });
        const fileFilter = (req, file, cb) => {
            console.log('File filter check:', {
                fileType,
                mimetype: file.mimetype,
                originalname: file.originalname
            });
            if (fileType === 'pdf') {
                if (file.mimetype === 'application/pdf')
                    cb(null, true);
                else
                    cb(new Error("Sadece PDF dosyaları yüklenebilir!"));
            }
            else if (fileType === 'image') {
                if (file.mimetype.startsWith("image/"))
                    cb(null, true);
                else
                    cb(new Error("Sadece resim dosyaları yüklenebilir!"));
            }
            else {
                cb(new Error("Geçersiz dosya tipi!"));
            }
        };
        const qmDocumentsUpload = (0, multer_1.default)({
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
    }
    catch (error) {
        console.error('Upload controller error:', error);
        res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.uploadQMDocumentsFile = uploadQMDocumentsFile;
