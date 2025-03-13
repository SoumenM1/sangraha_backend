// server.js (Entry Point)
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import { checkDiskSpaceMiddleware } from './middleware/diskMiddleware.js';

dotenv.config();
const app = express();
// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(checkDiskSpaceMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);  
app.use('/api/users', userRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('MY/Cloud Storage Server is running...');
});

// Handle Unwanted Routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
