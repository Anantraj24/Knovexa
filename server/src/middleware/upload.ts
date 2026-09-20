import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';

// Ensure storage directory exists
if (!fs.existsSync(config.storage.uploadDir)) {
  fs.mkdirSync(config.storage.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.storage.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${Date.now()}_${uuidv4().slice(0, 8)}_${safeBase}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedMimes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const allowedExtensions = ['.pdf', '.docx', '.txt'];

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: config.storage.maxFileSizeMb * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext) || !allowedMimes.includes(file.mimetype)) {
      return cb(
        new AppError(
          'UNSUPPORTED_MEDIA_TYPE',
          'Only PDF (.pdf), Word (.docx), and plain text (.txt) files are supported.',
          415
        )
      );
    }
    cb(null, true);
  },
});
