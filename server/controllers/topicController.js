import multer from 'multer';
import Topic from '../models/Topic.js';
import path from 'path';

import csvParser from 'csv-parser';
import fs from 'fs';

// Initialize core directories to prevent MULTER ENOENT crashes
['Content', 'Content/videos', 'Content/flashcards', 'Content/thumbnails'].forEach(dir => {
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'videos') {
      cb(null, 'Content/videos');
    } else if (file.fieldname === 'csvFile') {
      cb(null, 'Content/flashcards');
    } else if (file.fieldname === 'thumbnail') {
      cb(null, 'Content/thumbnails');
    } else {
      cb(null, 'Content/'); // fallback
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });

export const createTopic = async (req, res) => {
  try {
    const { title, description, level } = req.body;
    
    // Parse uploaded videos
    const videos = [];
    if (req.files && req.files['videos']) {
      for (const file of req.files['videos']) {
        videos.push({
          title: file.originalname,
          filepath: `http://localhost:3000/Content/videos/${file.filename}` 
        });
      }
    }

    // Parse uploaded thumbnail
    let thumbnail = "";
    if (req.files && req.files['thumbnail']) {
        thumbnail = `http://localhost:3000/Content/thumbnails/${req.files['thumbnail'][0].filename}`;
    }

    // Parse uploaded CSV flashcards
    const flashcards = [];
    if (req.files && req.files['csvFile']) {
      const csvFilePath = req.files['csvFile'][0].path;
      
      const results = await new Promise((resolve, reject) => {
        const parsed = [];
        fs.createReadStream(csvFilePath)
          .pipe(csvParser())
          .on('data', (data) => parsed.push(data))
          .on('end', () => resolve(parsed))
          .on('error', (err) => reject(err));
      });
      
      // Map generic CSV headers to our schema
      results.forEach(row => {
          // Look for front/question strings
          const frontKey = Object.keys(row).find(k => k.toLowerCase().includes('front') || k.toLowerCase().includes('question'));
          const backKey = Object.keys(row).find(k => k.toLowerCase().includes('back') || k.toLowerCase().includes('answer'));
          
          if (frontKey && backKey) {
             flashcards.push({
                 frontContext: row[frontKey],
                 backAnswer: row[backKey]
             });
          }
      });
    }

    const topic = new Topic({
      title,
      description,
      level,
      thumbnail,
      videos,
      flashcards,
    });

    await topic.save();
    res.status(201).json({ success: true, topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ success: false, message: "Topic not found" });
        }
        res.status(200).json({ success: true, topic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
