import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { requestLogger, errorHandler } from '../shared/middlewares';
import router from './routes';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use(router);

app.use(errorHandler);

export default app;
