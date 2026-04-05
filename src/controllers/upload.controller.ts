import { Request, Response } from 'express';

export const uploadMedia = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    // Construct dynamic path string based on the server host port
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Respond back with the path so the Frontend can save it in the College/Global record
    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
