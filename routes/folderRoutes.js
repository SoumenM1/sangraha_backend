import express from 'express';
import { createFolder, getFolderContents, deleteFolder } from '../controllers/folderController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, createFolder);
router.get('/:folderId', authMiddleware, getFolderContents);
router.delete('/:folderId', authMiddleware, deleteFolder);

export default router;
