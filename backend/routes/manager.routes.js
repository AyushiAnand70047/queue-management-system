import express from 'express';
import { registerManager, loginManager } from '../controller/manager.controller.js';

const router = express.Router()

router.post('/register', registerManager);
router.post('/login', loginManager);

export default router;