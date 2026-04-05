import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Dynamically create the public/uploads directory if it doesn't structurally exist
const uploadDir = path.resolve('public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Allowed 10MB limit for high-res galleries
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only standard image files (JPG, PNG, WEBP, SVG) are allowed!'));
  }
});

export default upload;
