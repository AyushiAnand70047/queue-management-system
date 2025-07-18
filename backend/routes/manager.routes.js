import express from 'express';
import { registerManager, loginManager, getManagerById } from '../controller/manager.controller.js';
import { get } from 'mongoose';

const router = express.Router()

router.post('/register', registerManager);
router.post('/login', loginManager);
router.get('/:id', getManagerById);

export default router;