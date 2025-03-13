// utils/formatSize.js
export const formatSize = (size) => {
    const TB = 1024 * 1024 * 1024 * 1024;
    const GB = 1024 * 1024 * 1024;
    const MB = 1024 * 1024;
    
    if (size >= TB) return (size / TB).toFixed(2) + ' TB';
    if (size >= GB) return (size / GB).toFixed(2) + ' GB';
    if (size >= MB) return (size / MB).toFixed(2) + ' MB';
    return size + ' Bytes';
  };