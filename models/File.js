import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  size: { type: Number, required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null }, // File belongs to a folder
  sharedLink: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('File', fileSchema);
