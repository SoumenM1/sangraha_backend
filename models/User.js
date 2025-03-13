import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  usedStorage: { type: Number, default: 0 } // Track storage usage
}, { timestamps: true });

export default mongoose.model('User', userSchema);
