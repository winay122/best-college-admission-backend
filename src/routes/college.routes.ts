import { Router } from 'express';
import {
  getColleges, getCollegeById, getCollegeBySlug, createCollege, updateCollege, deleteCollege,
  updateInfo, updatePlacement,
  addCourse, updateCourse, deleteCourse,
  addGallery, deleteGallery,
  addAccreditation, deleteAccreditation,
  addDeadline, deleteDeadline,
  addFAQ, deleteFAQ,
  addRecruiter, deleteRecruiter
} from '../controllers/college.controller.js';
import { protectRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Base College CRUD
router.route('/')
  .get(getColleges)
  .post(protectRoute, requireAdmin, createCollege);

router.route('/:id')
  .get(getCollegeById)
  .put(protectRoute, requireAdmin, updateCollege)
  .delete(protectRoute, requireAdmin, deleteCollege);

router.get('/slug/:slug', getCollegeBySlug);

// Micro-Component Injection Endpoints
router.put('/:id/info', protectRoute, requireAdmin, updateInfo);
router.put('/:id/placement', protectRoute, requireAdmin, updatePlacement);

router.post('/:id/courses', protectRoute, requireAdmin, addCourse);
router.put('/:id/courses/:courseId', protectRoute, requireAdmin, updateCourse);
router.delete('/:id/courses/:courseId', protectRoute, requireAdmin, deleteCourse);

router.post('/:id/gallery', protectRoute, requireAdmin, addGallery);
router.delete('/:id/gallery/:galleryId', protectRoute, requireAdmin, deleteGallery);

router.post('/:id/accreditations', protectRoute, requireAdmin, addAccreditation);
router.delete('/:id/accreditations/:accId', protectRoute, requireAdmin, deleteAccreditation);

// Deadlines
router.post('/:id/deadlines', protectRoute, requireAdmin, addDeadline);
router.delete('/:id/deadlines/:deadlineId', protectRoute, requireAdmin, deleteDeadline);

// FAQs
router.post('/:id/faqs', protectRoute, requireAdmin, addFAQ);
router.delete('/:id/faqs/:faqId', protectRoute, requireAdmin, deleteFAQ);

// Recruiters / Hiring Partners
router.post('/:id/recruiters', protectRoute, requireAdmin, addRecruiter);
router.delete('/:id/recruiters/:recruiterId', protectRoute, requireAdmin, deleteRecruiter);

export default router;
