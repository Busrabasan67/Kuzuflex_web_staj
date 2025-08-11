import express from 'express';
import {
  getAboutPage,
  createAboutPage,
  updateAboutPage,
  deleteAboutPage,
  getAllAboutPages
} from '../controllers/aboutPageController';

const router = express.Router();

// Hakkımızda sayfasını getir (public)
router.get('/', getAboutPage);

// Admin routes
router.get('/admin', getAllAboutPages);
router.post('/', createAboutPage);
router.put('/:id', updateAboutPage);
router.delete('/:id', deleteAboutPage);

export default router;
