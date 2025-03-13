// routes/userRoutes.js
import express from 'express';
import { getStorageInfo } from '../controllers/userController.js';
const router = express.Router();
router.get('/storage-info', getStorageInfo);
export default router;