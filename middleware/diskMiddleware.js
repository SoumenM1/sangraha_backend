import checkDiskSpace from 'check-disk-space';
import os from 'os';
import fs from 'fs';

// Function to get available drives on Windows
const getAvailableDrives = () => {
  if (process.platform !== 'win32') return ['/']; // Return root for Linux/macOS

  const drives = [];
  for (let i = 65; i <= 90; i++) { // A-Z drive letters
    const drive = `${String.fromCharCode(i)}:/`;
    if (fs.existsSync(drive)) {
      drives.push(drive);
    }
  }
  return drives;
};

// Function to find a drive with at least 20GB free space
const findSuitableDrive = async () => {
  const drives = getAvailableDrives();
  for (const drive of drives) {
    try {
      const { free } = await checkDiskSpace(drive);
      if (free >= 20 * 1024 * 1024 * 1024) { // 20GB threshold
        return drive;
      }
    } catch (error) {
      console.error(`Error checking disk space for ${drive}:`, error.message);
    }
  }
  return null;
};

// Middleware to check and use the best available drive
export const checkDiskSpaceMiddleware = async (req, res, next) => {
  try {
    const selectedDrive = await findSuitableDrive();
    if (!selectedDrive) {
      return res.status(503).json({ message: 'No suitable storage drive found' });
    }
    console.log(`Using storage drive: ${selectedDrive}`);
    req.selectedDrive = selectedDrive; // Attach selected drive to request
    next();
  } catch (err) {
    console.error('Disk space check failed:', err.message);
    res.status(500).json({ message: 'Failed to check disk space' });
  }
};
