import express from 'express';
import { createTopic, listTopics, getTopic, deleteTopic, updateTopic, upload } from '../controllers/topicController.js';

const router = express.Router();

router.post('/add', upload.fields([{ name: 'videos', maxCount: 10 }, { name: 'csvFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createTopic);
router.get('/list', listTopics);
router.put('/:id', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), updateTopic);
router.delete('/:id', deleteTopic);
router.get('/:id', getTopic);

export default router;
