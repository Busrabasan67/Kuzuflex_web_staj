import express from 'express';
import { getEmailSettings, updateEmailSettings, testEmailConnection } from '../controllers/emailSettingsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Tüm email settings route'ları admin authentication gerektirir
router.use(authenticateToken);

// Email ayarlarını getir
router.get('/', getEmailSettings);

// Email ayarlarını güncelle
router.put('/', updateEmailSettings);

// Email bağlantısını test et
router.post('/test-connection', testEmailConnection);

export default router;
