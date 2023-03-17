import express from 'express';
import upload from '../file-upload-middleware.js';
import { createSessionController } from './sessions-controllers.js';

const sessionsRouter = express.Router();

sessionsRouter
  .route('/create')
  .post(upload.single('session-cover'), createSessionController);

export default sessionsRouter;
