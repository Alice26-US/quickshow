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

// Test route
app.get('/', (req, res) => res.send('Server is Live!'));

// Inngest route
app.use('/api/inngest', serve({ client: inngest, functions }));

// Start server
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));