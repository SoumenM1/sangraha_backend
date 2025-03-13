import checkDiskSpace from 'check-disk-space';
import User from '../models/User.js';
import { formatSize } from '../utils/formatSize.js';
import fs from 'fs';

// Function to get available drives on Windows
const getAvailableDrives = () => {
  if (process.platform !== 'win32') return ['/']; // Use root for Linux/macOS

  const drives = [];
  for (let i = 65; i <= 90; i++) { // Check drive letters A-Z
    const drive = `${String.fromCharCode(i)}:/`;
    if (fs.existsSync(drive)) {
      drives.push(drive);
    }
  }
  return drives;
};

// Function to find the best drive with at least 20GB free space
const findBestDrive = async () => {
  const drives = getAvailableDrives();
  for (const drive of drives) {
    try {
      const { free, size } = await checkDiskSpace(drive);
      if (free >= 20 * 1024 * 1024 * 1024) { // 20GB threshold
        return { drive, free, size };
      }
    } catch (error) {
      console.error(`Error checking disk space for ${drive}:`, error.message);
    }
  }
  return null;
};

// Controller to get storage details
export const getStorageInfo = async (req, res) => {
  try {
    const bestDrive = await findBestDrive();

    if (!bestDrive) {
      return res.status(503).json({ message: 'No suitable storage drive found' });
    }

    const users = await User.find();
    const totalUsed = users.reduce((acc, user) => acc + user.usedStorage, 0);
    const systemUsedStorage = bestDrive.size - bestDrive.free - totalUsed;
    res.json({
      selectedDrive: bestDrive.drive,
      totalStorage: formatSize(bestDrive.size),
      usedStorage: {
        userStorage: formatSize(totalUsed),
        systemStorage: formatSize(systemUsedStorage),
      },
      freeStorage: formatSize(bestDrive.free),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching storage info', error: err.message });
  }
};
