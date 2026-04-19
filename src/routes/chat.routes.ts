import { Router } from 'express';
import { getChatHistory, syncLeadProfile, getChatInbox } from '../controllers/chat.controller.js';

const router = Router();

router.get('/inbox', getChatInbox);

/**
 * @swagger
 * /api/chat/history/{phone}:
 *   get:
 *     summary: Get chat history for a specific lead
 *     tags: [Chat]
 */
router.get('/history/:phone', getChatHistory);

/**
 * @swagger
 * /api/chat/sync:
 *   post:
 *     summary: Sync lead profile by phone (No-Auth session start)
 *     tags: [Chat]
 */
router.post('/sync', syncLeadProfile);

export default router;
