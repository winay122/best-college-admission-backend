import { Router } from 'express';
import { getGlobalSettings, updateGlobalSettings } from '../controllers/setting.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Public route to fetch footer data, logo, etc.
router.get('/', getGlobalSettings);

// Protected routes for CMS administration
router.put('/', protectRoute, requireAdmin, updateGlobalSettings);

export default router;
