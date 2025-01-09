import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

import routes from './routes/index';
import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json({ limit: '3mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    credentials: true,
  })
);

app.use((err: any, req: any, res: any, next: any) => {
  console.log(err);
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
});

app.use('/', routes);

export const handler = serverless(app);
