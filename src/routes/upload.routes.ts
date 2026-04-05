import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { uploadMedia } from '../controllers/upload.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Secure file upload route specifically restricted to Admins managing CMS attributes
router.post('/', protectRoute, requireAdmin, upload.single('file'), uploadMedia);

export default router;
