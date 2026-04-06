import { Router } from 'express';
import { createBanner, updateBanner, deleteBanner, getAllBanners } from '../controllers/banner.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Public route to fetch banners for the Homepage slider
router.get('/', getAllBanners);

// Protected routes for CMS administration
router.post('/', protectRoute, requireAdmin, createBanner);
router.put('/:id', protectRoute, requireAdmin, updateBanner);
router.delete('/:id', protectRoute, requireAdmin, deleteBanner);

export default router;
