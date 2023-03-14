import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRouter from './api/auth/auth-router.js';
import errorHandler from './utils/error-handler.js';

const app = express();

app.disable('x-powered-by');

app.use(cors());

app.get('/', (req, res) => {
  res.json('server is up!');
});

app.use(express.json());

app.use('/auth', authRouter);

app.use(bodyParser.json());

app.use(errorHandler);

export default app;
