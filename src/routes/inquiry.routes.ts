import { Router } from 'express';
import { getInquiries, updateInquiryStatus } from '../controllers/inquiry.controller.js';
import { protectRoute } from '../middlewares/authMiddleware.js';

const router = Router();

router.route('/')
  .get(protectRoute, getInquiries);

router.route('/:id/status')
  .put(protectRoute, updateInquiryStatus);

export default router;
