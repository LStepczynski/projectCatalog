import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

import routes from './routes/index';
import fs from 'fs/promises';
import path from 'path';
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
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
