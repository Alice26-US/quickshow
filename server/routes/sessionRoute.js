import express from 'express';
import { createSession, getSession, saveChatMessage, getAllSessions, getUserSessions } from '../controllers/sessionController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/list', getAllSessions);
router.get('/my-sessions', requireAuth, getUserSessions);
router.post('/start', createSession);
router.get('/:id', getSession);
router.post('/chat', saveChatMessage);

export default router;
