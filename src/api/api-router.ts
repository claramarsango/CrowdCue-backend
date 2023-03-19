import express from 'express';
import sessionsRouter from './sessions/sessions-router.js';

const apiRouter = express.Router();

apiRouter.use('/sessions', sessionsRouter);

export default apiRouter;
