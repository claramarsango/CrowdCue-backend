import express from 'express';
import upload from '../file-upload-middleware.js';
import {
  createParticipantController,
  createSessionController,
  deleteSessionByIdController,
  getAllSessionsController,
  getSessionByIdController,
} from './sessions-controllers.js';

const sessionsRouter = express.Router();

sessionsRouter
  .route('/')
  .post(upload.single('session-cover'), createSessionController);

sessionsRouter.route('/explore').get(getAllSessionsController);

sessionsRouter
  .route('/:_id')
  .get(getSessionByIdController)
  .post(createParticipantController)
  .delete(deleteSessionByIdController);

export default sessionsRouter;
