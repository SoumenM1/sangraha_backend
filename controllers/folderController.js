import File from '../models/File.js';
import Folder from '../models/Folder.js';


export const createFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;

    // Check for duplicate folder in the same location
    const existingFolder = await Folder.findOne({ name, user: req.user.id, parentFolder });
    if (existingFolder) return res.status(400).json({ message: 'Folder already exists' });

    const newFolder = new Folder({ name, user: req.user.id, parentFolder });
    await newFolder.save();

    res.status(201).json({ message: 'Folder created successfully', folder: newFolder });
  } catch (err) {
    res.status(500).json({ message: 'Error creating folder', error: err.message });
  }
};


export const getFolderContents = async (req, res) => {
  try {
    const { folderId } = req.params;

    const folders = await Folder.find({ user: req.user.id, parentFolder: folderId });
    const files = await File.find({ user: req.user.id, folder: folderId });

    res.json({ folders, files });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching contents', error: err.message });
  }
};

export const deleteFolder = async (req, res) => {
    try {
      const { folderId } = req.params;
      const folder = await Folder.findById(folderId);
  
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      if (folder.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
  
      // Delete all nested folders and files
      const deleteRecursive = async (folderId) => {
        const subFolders = await Folder.find({ parentFolder: folderId });
        for (const subFolder of subFolders) await deleteRecursive(subFolder._id);
  
        await File.deleteMany({ folder: folderId });
        await Folder.findByIdAndDelete(folderId);
      };
  
      await deleteRecursive(folderId);
  
      res.json({ message: 'Folder and contents deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting folder', error: err.message });
    }
  };
  