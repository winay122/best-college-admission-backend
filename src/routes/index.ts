import { Router, Request, Response } from 'express';
import prisma from '../config/db.js';
import authRoutes from './auth.routes.js';
import collegeRoutes from './college.routes.js';
import inquiryRoutes from './inquiry.routes.js';
import settingRoutes from './setting.routes.js';
import uploadRoutes from './upload.routes.js';
import degreeRoutes from './degree.routes.js';
import universityRoutes from './university.routes.js';
import bannerRoutes from './banner.routes.js';
import specializationRoutes from './specialization.routes.js';
import facilityRoutes from './facility.routes.js';
import chatRoutes from './chat.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/colleges', collegeRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/settings', settingRoutes);
router.use('/upload', uploadRoutes);
router.use('/degrees', degreeRoutes);
router.use('/universities', universityRoutes);
router.use('/banners', bannerRoutes);
router.use('/specializations', specializationRoutes);
router.use('/facilities', facilityRoutes);
router.use('/chat', chatRoutes);
router.use('/dashboard', dashboardRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     description: Check the API health status
 *     responses:
 *       200:
 *         description: Success, backend is running seamlessly.
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running smoothly' });
});

/**
 * @swagger
 * /api/test-db:
 *   get:
 *     description: Verify Prisma connection to PostgreSQL
 *     responses:
 *       200:
 *         description: Database connection is successful and returns college data.
 *       500:
 *         description: Internal server error mapping to Prisma failure.
 */
router.get('/test-db', async (req: Request, res: Response) => {
  try {
    const colleges = await prisma.college.findMany();
    res.json({ success: true, data: colleges });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
