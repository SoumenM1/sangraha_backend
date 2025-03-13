import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Folder from '../models/Folder.js';
import File from '../models/File.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/${req.user.id}/${req.body.folderId || ''}`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage }).single('file');

// 📂 Create a New Folder
export const createFolder = async (req, res) => {
  try {
    const { name, parent = null } = req.body;
    const userId = req.user.id;
    const parentFolder = parent ? await Folder.findById(parent) : null;
    const folderPath = parentFolder ? `${parentFolder.path}/${name}` : `uploads/${userId}/${name}`;

    if (!name) return res.status(400).json({ message: 'Folder name is required' });

    fs.mkdirSync(folderPath, { recursive: true });

    const newFolder = new Folder({ user: userId, name, parent, path: folderPath });
    await newFolder.save();

    res.status(201).json({ message: 'Folder created', folder: newFolder });
  } catch (err) {
    res.status(500).json({ message: 'Error creating folder', error: err.message });
  }
};

// 📄 Upload File to a Folder
export const uploadFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ message: err.message });

    const { filename, size, path: filepath } = req.file;
    const { folderId } = req.body;
    const user = await User.findById(req.user.id);

    if (user.usedStorage + size > 5 * 1024 * 1024 * 1024) {
      return res.status(400).json({ message: 'Storage limit exceeded' });
    }

    user.usedStorage += size;
    await user.save();

    const newFile = new File({ user: req.user.id, filename, filepath, size, folder: folderId || null });
    await newFile.save();
    res.json({ message: 'File uploaded', file: newFile });
  });
};
// 📂 Get All Folders and Files in a Directory
export const getFoldersAndFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { parent = null } = req.query;

    const folders = await Folder.find({ user: userId, parent });
    const files = await File.find({ user: userId, folder: parent });

    res.json({ folders, files });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching folders/files', error: err.message });
  }
};

// 🌐 Generate a Shareable Link
export const generateShareableLink = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    // Generate a unique link if not already shared
    if (!file.sharedLink) {
      file.sharedLink = uuidv4();
      await file.save();
    }

    res.json({ message: 'Shareable link generated', link: `${req.protocol}://${req.get('host')}/api/files/shared/${file.sharedLink}` });
  } catch (err) {
    res.status(500).json({ message: 'Error generating link', error: err.message });
  }
};

// 🔗 Access Shared File
export const accessSharedFile = async (req, res) => {
  try {
    const { sharedLink } = req.params;
    const file = await File.findOne({ sharedLink });

    if (!file) return res.status(404).json({ message: 'Invalid or expired link' });

    res.json({ filename: file.filename, fileUrl: `${req.protocol}://${req.get('host')}/${file.filepath}` });
  } catch (err) {
    res.status(500).json({ message: 'Error accessing shared file', error: err.message });
  }
};

// ❌ Remove Shareable Link
export const removeShareableLink = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    file.sharedLink = null;
    await file.save();

    res.json({ message: 'Shareable link removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing shareable link', error: err.message });
  }
};