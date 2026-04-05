import { Router } from 'express';
import { 
  getUniversities, 
  createUniversity, 
  updateUniversity, 
  deleteUniversity 
} from '../controllers/university.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getUniversities);
router.post('/', protectRoute, requireAdmin, createUniversity);
router.put('/:id', protectRoute, requireAdmin, updateUniversity);
router.delete('/:id', protectRoute, requireAdmin, deleteUniversity);

export default router;
