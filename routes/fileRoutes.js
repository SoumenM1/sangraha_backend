import express from 'express';
import { createFolder, uploadFile, getFoldersAndFiles, generateShareableLink, accessSharedFile, removeShareableLink } from '../controllers/fileController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/folder', authMiddleware, createFolder);
router.post('/upload', authMiddleware, uploadFile);
router.get('/list', authMiddleware, getFoldersAndFiles);
router.post('/share/:fileId', authMiddleware, generateShareableLink); // 🔗 Generate shareable link
router.get('/shared/:sharedLink', accessSharedFile); // 🌍 Access shared file
router.delete('/share/:fileId', authMiddleware, removeShareableLink); // ❌ Remove shareable link


export default router;
