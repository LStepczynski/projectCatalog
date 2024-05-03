import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

import routes from './routes/index';

const app = express();

app.use(
  cors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  })
);

app.use(express.json());

app.use('/', routes);

export const handler = serverless(app);
