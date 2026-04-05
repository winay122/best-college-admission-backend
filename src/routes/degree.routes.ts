import { Router } from 'express';
import { getDegrees, createDegree, updateDegree, deleteDegree } from '../controllers/degree.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Publicly readable for website filters
router.get('/', getDegrees);

// Admin-only mutation protocols
router.post('/', protectRoute, requireAdmin, createDegree);
router.put('/:id', protectRoute, requireAdmin, updateDegree);
router.delete('/:id', protectRoute, requireAdmin, deleteDegree);

export default router;
