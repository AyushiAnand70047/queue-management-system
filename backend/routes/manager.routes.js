import express from 'express';
import {
  registerManager,
  loginManager,
  getManagerById,
  createQueue,
  addPersonToQueue,
  getQueuesByManager,
  getPersonsByManagerAndQueue,
  deletePersonById
} from '../controller/manager.controller.js';

const router = express.Router();

// Manager authentication routes
router.post('/register', registerManager);
router.post('/login', loginManager);
router.get('/:id', getManagerById);

// Queue management routes
router.post('/queue', createQueue);
router.post('/person', addPersonToQueue);
router.get('/queues/:managerId', getQueuesByManager);
router.get('/:managerId/queue/:queueId/persons', getPersonsByManagerAndQueue);
router.delete('/person/:personId', deletePersonById);

export default router;