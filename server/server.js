import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from './inngest/index.js';

const app = express();
const port = process.env.PORT || 3000;

// Connect MongoDB
await connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Serve static content from 'Content' directory
app.use('/Content', express.static('Content'));

import topicRouter from './routes/topicRoute.js';
import sessionRouter from './routes/sessionRoute.js';
import aiRouter from './routes/aiRoute.js';
import userRouter from './routes/userRoute.js';

// API Routes
app.use('/api/topics', topicRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/ai', aiRouter);
app.use('/api/users', userRouter);

// Test route
app.get('/', (req, res) => res.send('Server is Live!'));

// Inngest route
app.use('/api/inngest', serve({ client: inngest, functions }));

// Start server
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));