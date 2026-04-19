import { Router } from 'express';
import { getInquiries, updateInquiryStatus, createInquiry } from '../controllers/inquiry.controller.js';
import { protectRoute } from '../middlewares/authMiddleware.js';

const router = Router();

router.route('/')
  .get(protectRoute, getInquiries)
  .post(createInquiry); // Public route for submitting inquiries

router.route('/:id/status')
  .put(protectRoute, updateInquiryStatus);

export default router;
