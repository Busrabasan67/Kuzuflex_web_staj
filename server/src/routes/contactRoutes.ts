import express from 'express';
import { submitContactForm, sendDirectEmail, testMailConnection } from '../controllers/contactController';

const router = express.Router();

// Contact form submission
router.post('/submit', submitContactForm);

// Direct email sending
router.post('/send-direct', sendDirectEmail);

// Test mail connection (for debugging)
router.get('/test-connection', testMailConnection);

export default router;
