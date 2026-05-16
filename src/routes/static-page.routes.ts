import { Router } from 'express';
import { getAllPages, getPageBySlug, createPage, updatePage, deletePage } from '../controllers/static-page.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Public route to fetch pages for the User Portal
router.get('/', getAllPages);
router.get('/:slug', getPageBySlug);

// Protected routes for CMS administration
router.post('/', protectRoute, requireAdmin, createPage);
router.put('/:id', protectRoute, requireAdmin, updatePage);
router.delete('/:id', protectRoute, requireAdmin, deletePage);

export default router;
