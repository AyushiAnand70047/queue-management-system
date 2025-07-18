import express from 'express';
import { registerManager } from '../controller/manager.controller.js';

const router = express.Router()

router.post('/register', registerManager);

export default router;