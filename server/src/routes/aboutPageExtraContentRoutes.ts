import express from 'express';
import {
  createMultiLanguageExtraContent,
  createExtraContent,
  getExtraContent,
  getAllExtraContents,
  updateExtraContent,
  updateGroupExtraContent,
  deleteExtraContent,
  getExtraContentsByLanguage
} from '../controllers/aboutPageExtraContentController';

const router = express.Router();

// Çoklu dil için ekstra içerik ekle
router.post('/multi', createMultiLanguageExtraContent);

// Tek ekstra içerik ekle
router.post('/', createExtraContent);

// Ekstra içerik getir
router.get('/:id', getExtraContent);

// Tüm ekstra içerikleri getir
router.get('/', getAllExtraContents);

// Dil bazında ekstra içerikleri getir
router.get('/language/:language', getExtraContentsByLanguage);

// Grup güncelleme - önce tanımlanmalı
router.put('/update-group', updateGroupExtraContent);

// Ekstra içerik güncelle
router.put('/:id', updateExtraContent);

// Ekstra içerik sil
router.delete('/:id', deleteExtraContent);

export default router;
