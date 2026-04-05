import { Router } from 'express';
import { loginAdmin } from '../controllers/auth.controller.js';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     description: Authenticate Admin/Staff to get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success, returns serialized user object and JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginAdmin);

export default router;
