import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dynamic stats for admin dashboard
 *     tags: [Dashboard]
 */
router.get('/stats', getDashboardStats);

export default router;
