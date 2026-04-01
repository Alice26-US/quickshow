import express from 'express';
import { createTopic, listTopics, getTopic, upload } from '../controllers/topicController.js';

const router = express.Router();

router.post('/add', upload.fields([{ name: 'videos', maxCount: 10 }, { name: 'csvFile', maxCount: 1 }]), createTopic);
router.get('/list', listTopics);
router.get('/:id', getTopic);

export default router;
