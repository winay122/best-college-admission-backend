import { Router } from 'express';
import { createNews, updateNews, deleteNews, getAllNews, getNewsById } from '../controllers/news.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Public route to fetch news articles for the Homepage
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Protected routes for CMS administration
router.post('/', protectRoute, requireAdmin, createNews);
router.put('/:id', protectRoute, requireAdmin, updateNews);
router.delete('/:id', protectRoute, requireAdmin, deleteNews);

export default router;
