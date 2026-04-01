import express from 'express';
import { createSession, getSession, saveChatMessage } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/start', createSession);
router.get('/:id', getSession);
router.post('/chat', saveChatMessage);

export default router;
