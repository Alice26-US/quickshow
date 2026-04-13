import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './configs/db.js';
import { requireAuth } from "./middlewares/authMiddleware.js";
import { requireAdmin } from "./middlewares/adminMiddleware.js";
import { serve } from "inngest/express";
import { inngest, functions } from './inngest/index.js';

const app = express();
const port = process.env.PORT || 3000;

// Connect MongoDB in background so the API can still boot while DB connects.
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
// Setup local auth if needed here


// Serve static content from 'Content' directory
app.use('/Content', express.static('Content'));

import topicRouter from './routes/topicRoute.js';
import sessionRouter from './routes/sessionRoute.js';
import aiRouter from './routes/aiRoute.js';
import userRouter from './routes/userRoute.js';
import authRouter from './routes/authRoute.js';
import adminRouter from './routes/adminRoute.js';
import requestRouter from './routes/contentRequestRoute.js';

// API Routes
app.use('/api/topics', topicRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/ai', aiRouter);
app.use('/api/users', requireAuth, userRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', requireAuth, requireAdmin, adminRouter);
app.use('/api/requests', requireAuth, requestRouter);

// Test route
app.get('/', (req, res) => res.send('Server is Live!'));
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    success: true,
    server: "up",
    database: states[dbState] || "unknown",
  });
});

// Inngest route
app.use('/api/inngest', serve({ client: inngest, functions }));

// Start server
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
