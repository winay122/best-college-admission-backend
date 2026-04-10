import express from 'express';
import { getFacilities, createFacility, updateFacility, deleteFacility } from '../controllers/facility.controller.js';
import { protectRoute as authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getFacilities);
router.post('/', authenticate, createFacility);
router.put('/:id', authenticate, updateFacility);
router.delete('/:id', authenticate, deleteFacility);

// Public route to fetch active facilities for user-portal
router.get('/public/all', getFacilities);

export default router;
