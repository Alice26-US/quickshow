import multer from 'multer';
import Topic from '../models/Topic.js';
import path from 'path';

import csvParser from 'csv-parser';
import fs from 'fs';

const CONTENT_ROOT = path.resolve('Content');
const DELIMITER_CANDIDATES = [',', ';', '\t', '|'];
const ALLOWED_TOPIC_FIELDS = new Set(["Engineering", "Medical", "Agricultural"]);
const TOPIC_FIELD_ALIASES = {
  Health: "Medical",
  Agriculture: "Agricultural",
};

const normalizeTopicField = (candidate) => {
  const normalizedCandidate = TOPIC_FIELD_ALIASES[candidate] || candidate;
  return ALLOWED_TOPIC_FIELDS.has(normalizedCandidate) ? normalizedCandidate : "Engineering";
};

const toLocalMediaPath = (mediaPath) => {
  if (!mediaPath) return null;

  let pathname = mediaPath;
  if (/^https?:\/\//i.test(mediaPath)) {
    try {
      pathname = new URL(mediaPath).pathname;
    } catch {
      return null;
    }
  }

  const normalizedPath = pathname.replace(/\\/g, '/');
  const withLeadingSlash = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  if (!withLeadingSlash.toLowerCase().startsWith('/content/')) {
    return null;
  }

  const relativePath = withLeadingSlash.replace(/^\/+/, '');
  const resolvedPath = path.resolve(relativePath);
  const safePrefix = `${CONTENT_ROOT}${path.sep}`;
  if (resolvedPath !== CONTENT_ROOT && !resolvedPath.startsWith(safePrefix)) {
    return null;
  }

  return resolvedPath;
};

const deleteLocalFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Failed to delete file ${filePath}:`, error.message);
    }
  }
};

const HEADER_FRONT_HINTS = ['front', 'question', 'prompt', 'term', 'context'];
const HEADER_BACK_HINTS = ['back', 'answer', 'definition', 'response', 'solution'];

const normalizeCell = (value) => String(value ?? '').trim();

const looksLikeHeader = (value, hints) => {
  const normalized = normalizeCell(value).toLowerCase();
  return hints.some((hint) => normalized === hint || normalized.includes(hint));
};

const getRowValues = (row) =>
  Object.keys(row)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => normalizeCell(row[key]));

const detectDelimiter = (rawCsv) => {
  const firstDataLine = String(rawCsv || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstDataLine) return ',';

  let selectedDelimiter = ',';
  let selectedScore = -1;

  for (const candidate of DELIMITER_CANDIDATES) {
    const occurrences = firstDataLine.split(candidate).length - 1;
    if (occurrences > selectedScore) {
      selectedScore = occurrences;
      selectedDelimiter = candidate;
    }
  }

  return selectedScore > 0 ? selectedDelimiter : ',';
};

const parseCsvRows = async (csvFilePath, separator) => {
  return new Promise((resolve, reject) => {
    const parsed = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser({ headers: false, skipLines: 0, separator }))
      .on('data', (data) => parsed.push(data))
      .on('end', () => resolve(parsed))
      .on('error', (err) => reject(err));
  });
};

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
  let csvFilePath = '';

  try {
    const { title, description, level, field } = req.body;
    const mediaBaseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Parse uploaded videos
    const videos = [];
    if (req.files && req.files['videos']) {
      for (const file of req.files['videos']) {
        videos.push({
          title: file.originalname,
          filepath: `${mediaBaseUrl}/Content/videos/${file.filename}` 
        });
      }
    }

    // Parse uploaded thumbnail
    let thumbnail = "";
    if (req.files && req.files['thumbnail']) {
        thumbnail = `${mediaBaseUrl}/Content/thumbnails/${req.files['thumbnail'][0].filename}`;
    }

    // Parse uploaded CSV flashcards
    const flashcards = [];
    if (req.files && req.files['csvFile']) {
      csvFilePath = req.files['csvFile'][0].path;

      const rawCsv = await fs.promises.readFile(csvFilePath, 'utf8');
      const detectedDelimiter = detectDelimiter(rawCsv);
      const rows = await parseCsvRows(csvFilePath, detectedDelimiter);

      let startIndex = 0;
      let frontIndex = 0;
      let backIndex = 1;

      if (rows.length > 0) {
        const firstValues = getRowValues(rows[0]);
        const detectedFront = firstValues.findIndex((value) => looksLikeHeader(value, HEADER_FRONT_HINTS));
        const detectedBack = firstValues.findIndex((value) => looksLikeHeader(value, HEADER_BACK_HINTS));

        if (detectedFront !== -1 && detectedBack !== -1 && detectedFront !== detectedBack) {
          startIndex = 1;
          frontIndex = detectedFront;
          backIndex = detectedBack;
        }
      }

      for (let i = startIndex; i < rows.length; i += 1) {
        const values = getRowValues(rows[i]);
        const frontContext = normalizeCell(values[frontIndex]);
        const backAnswer = normalizeCell(values[backIndex]);

        if (!frontContext || !backAnswer) continue;

        flashcards.push({
          frontContext,
          backAnswer,
        });
      }
    }

    const topic = new Topic({
      title,
      description,
      level,
      field: normalizeTopicField(field),
      thumbnail,
      videos,
      flashcards,
    });

    await topic.save();
    res.status(201).json({ success: true, topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await deleteLocalFile(csvFilePath);
  }
};

export const listTopics = async (req, res) => {
  try {
    const { field, q } = req.query;
    const filters = [];

    if (field && ALLOWED_TOPIC_FIELDS.has(field)) {
      if (field === "Engineering") {
        filters.push({ $or: [{ field: "Engineering" }, { field: { $exists: false } }] });
      } else {
        filters.push({ field });
      }
    }

    if (q && String(q).trim()) {
      const escapedQuery = String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filters.push({
        $or: [
        { title: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } },
        ],
      });
    }

    const filter = filters.length > 0 ? { $and: filters } : {};
    const topics = await Topic.find(filter).sort({ createdAt: -1 });
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

export const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    const { title, description, level, field } = req.body;

    if (title !== undefined) topic.title = title;
    if (description !== undefined) topic.description = description;
    if (level !== undefined) topic.level = level;
    if (field !== undefined) topic.field = normalizeTopicField(field);

    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const mediaBaseUrl = `${req.protocol}://${req.get('host')}`;
      const oldThumbnailPath = toLocalMediaPath(topic.thumbnail);
      topic.thumbnail = `${mediaBaseUrl}/Content/thumbnails/${req.files.thumbnail[0].filename}`;
      await deleteLocalFile(oldThumbnailPath);
    }

    await topic.save();
    return res.status(200).json({ success: true, topic, message: "Topic updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    const mediaRefs = [
      topic.thumbnail,
      ...(topic.videos || []).map((video) => video.filepath),
    ];

    const mediaPaths = [...new Set(mediaRefs.map(toLocalMediaPath).filter(Boolean))];

    await Topic.findByIdAndDelete(req.params.id);
    await Promise.all(mediaPaths.map(deleteLocalFile));

    return res.status(200).json({ success: true, message: "Topic deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
