import fs from 'fs';
import path from 'path';

// Utility to cleanly delete unused image files from the local server
export const deleteFile = (fileUrl: string | undefined | null) => {
  if (!fileUrl) return;

  // We only delete local files that belong to our /uploads directory
  try {
    const splitUrl = fileUrl.split('/uploads/');
    if (splitUrl.length > 1) {
      const filename = splitUrl[1];
      const filepath = path.resolve('public/uploads', filename);
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`[Cleanup] Successfully deleted unused file: ${filepath}`);
      }
    }
  } catch (err) {
    console.error(`[Cleanup] Error deleting file: ${fileUrl}`, err);
  }
};
