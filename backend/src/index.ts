import express from 'express';
import serverless from 'serverless-http';

import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from '@utils/middleware';
import routes from '@api/routes';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json({ limit: '3mb' })); // Limit payload size
app.use(cookieParser()); // Allow for reading cookies in routes

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    credentials: true,
  })
);

app.use('/', routes);

app.use(errorHandler); // Centralized error handling

export const handler = serverless(app);
