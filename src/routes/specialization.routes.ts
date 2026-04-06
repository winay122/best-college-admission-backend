import { Router } from 'express';
import { getAllSpecializations, createSpecialization, updateSpecialization, deleteSpecialization } from '../controllers/specialization.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getAllSpecializations);

// Protected routes for CMS administration
router.post('/', protectRoute, requireAdmin, createSpecialization);
router.put('/:id', protectRoute, requireAdmin, updateSpecialization);
router.delete('/:id', protectRoute, requireAdmin, deleteSpecialization);

export default router;
