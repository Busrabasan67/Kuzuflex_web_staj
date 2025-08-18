import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getAboutPage,
  createAboutPage,
  updateAboutPage,
  deleteAboutPage,
  getAllAboutPages
} from '../controllers/aboutPageController';

const router = express.Router();

// Upload klasörünü oluştur
const uploadDir = 'public/uploads/Pages';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Upload klasörü oluşturuldu:', uploadDir);
}

// Multer konfigürasyonu - Hero image upload için
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/Pages/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'page-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
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
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir'));
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: About Page
 *   description: About page management endpoints
 */

/**
 * @swagger
 * /api/about-page:
 *   get:
 *     summary: Get about page content
 *     description: Retrieve the about page content for public access
 *     tags: [About Page]
 *     responses:
 *       200:
 *         description: About page content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 heroImage:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: About page not found
 *       500:
 *         description: Internal server error
 */
// Hakkımızda sayfasını getir (public)
router.get('/', getAboutPage);

/**
 * @swagger
 * /api/about-page/admin:
 *   get:
 *     summary: Get all about pages (Admin only)
 *     description: Retrieve all about pages for admin management
 *     tags: [About Page]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All about pages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   heroImage:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
// Admin routes
router.get('/admin', getAllAboutPages);

/**
 * @swagger
 * /api/about-page:
 *   post:
 *     summary: Create new about page (Admin only)
 *     description: Create a new about page with content and hero image
 *     tags: [About Page]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the about page
 *                 example: "Hakkımızda"
 *               content:
 *                 type: string
 *                 description: Content of the about page
 *                 example: "Kuzuflex şirketi hakkında detaylı bilgi..."
 *               heroImage:
 *                 type: string
 *                 description: URL of the hero image
 *                 example: "/uploads/Pages/page-1234567890.jpg"
 *     responses:
 *       201:
 *         description: About page created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 aboutPage:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/', createAboutPage);

/**
 * @swagger
 * /api/about-page/{id}:
 *   put:
 *     summary: Update about page (Admin only)
 *     description: Update an existing about page by ID
 *     tags: [About Page]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: About page ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the about page
 *               content:
 *                 type: string
 *                 description: Content of the about page
 *               heroImage:
 *                 type: string
 *                 description: URL of the hero image
 *     responses:
 *       200:
 *         description: About page updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 aboutPage:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: About page not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateAboutPage);

/**
 * @swagger
 * /api/about-page/{id}:
 *   delete:
 *     summary: Delete about page (Admin only)
 *     description: Delete an about page by ID
 *     tags: [About Page]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: About page ID
 *     responses:
 *       200:
 *         description: About page deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: About page not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteAboutPage);

/**
 * @swagger
 * /api/about-page/upload-hero:
 *   post:
 *     summary: Upload hero image for about page (Admin only)
 *     description: Upload a hero image for the about page
 *     tags: [About Page]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Hero image file (JPG, PNG, WebP)
 *     responses:
 *       200:
 *         description: Hero image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hero resim başarıyla yüklendi"
 *                 url:
 *                   type: string
 *                   example: "/uploads/Pages/page-1234567890.jpg"
 *                 filename:
 *                   type: string
 *                   example: "page-1234567890.jpg"
 *       400:
 *         description: Bad request - Invalid file or file too large
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dosya boyutu 5MB'dan büyük olamaz"
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
// Hero image upload endpoint
router.post('/upload-hero', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Dosya boyutu 5MB\'dan büyük olamaz' });
      }
      return res.status(400).json({ message: `Upload hatası: ${err.message}` });
    } else if (err) {
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
  } catch (error) {
    console.error('Hero image upload error:', error);
    res.status(500).json({ 
      message: 'Resim yüklenirken hata oluştu',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
