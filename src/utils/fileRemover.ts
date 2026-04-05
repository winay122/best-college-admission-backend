import fs from 'fs';
import path from 'path';

/**
 * Removes a file safely from local storage if it is an uploaded file.
 * Safely ignores external URLs like https://via.placeholder.com or S3.
 */
export const removeLocalFile = (fileUrl: string | null | undefined) => {
  if (!fileUrl) return;

  try {
    // Only attempt to delete if it's explicitly locally routed via /uploads/
    if (fileUrl.includes('/uploads/')) {
      const filename = fileUrl.split('/uploads/')[1];
      if (!filename) return;

      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Storage Cleanup] Successfully removed physical file: ${filename}`);
      }
    }
  } catch (error) {
    console.error(`[Storage Cleanup] Failed to remove physical file from path.`, error);
  }
};
