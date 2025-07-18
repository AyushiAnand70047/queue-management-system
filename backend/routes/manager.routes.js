import express from 'express';
import { registerManager, loginManager, getManagerById, createQueue, addPersonToQueue, getQueuesByManager } from '../controller/manager.controller.js';
import { get } from 'mongoose';

const router = express.Router()

router.post('/register', registerManager);
router.post('/login', loginManager);
router.get('/:id', getManagerById);
router.post('/queue', createQueue);
router.post('/person', addPersonToQueue);
router.get('/queues/:managerId', getQueuesByManager);

export default router;