"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const aboutPageController_1 = require("../controllers/aboutPageController");
const router = express_1.default.Router();
// Upload klasörünü oluştur
const uploadDir = 'public/uploads/Pages';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
    console.log('Upload klasörü oluşturuldu:', uploadDir);
}
// Multer konfigürasyonu - Hero image upload için
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/Pages/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'page-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('File filter check:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Sadece resim dosyaları yüklenebilir'));
        }
    }
});
// Hakkımızda sayfasını getir (public)
router.get('/', aboutPageController_1.getAboutPage);
// Admin routes
router.get('/admin', aboutPageController_1.getAllAboutPages);
router.post('/', aboutPageController_1.createAboutPage);
router.put('/:id', aboutPageController_1.updateAboutPage);
router.delete('/:id', aboutPageController_1.deleteAboutPage);
// Hero image upload endpoint
router.post('/upload-hero', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            console.error('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Dosya boyutu 5MB\'dan büyük olamaz' });
            }
            return res.status(400).json({ message: `Upload hatası: ${err.message}` });
        }
        else if (err) {
            console.error('Other upload error:', err);
            return res.status(400).json({ message: err.message });
        }
        // Upload başarılı, ana handler'a geç
        next();
    });
}, async (req, res) => {
    try {
        console.log('Upload request received:', req.body);
        console.log('Upload file:', req.file);
        if (!req.file) {
            return res.status(400).json({ message: 'Resim dosyası bulunamadı' });
        }
        const imageUrl = `/uploads/Pages/${req.file.filename}`;
        console.log('Image saved successfully:', {
            filename: req.file.filename,
            path: req.file.path,
            url: imageUrl
        });
        res.json({
            message: 'Hero resim başarıyla yüklendi',
            url: imageUrl,
            filename: req.file.filename
        });
    }
    catch (error) {
        console.error('Hero image upload error:', error);
        res.status(500).json({
            message: 'Resim yüklenirken hata oluştu',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
