import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Everyone can view global settings
router.get('/', getSettings);

// Only admins can push global updates
router.put('/', protectRoute, requireAdmin, updateSettings);

export default router;
