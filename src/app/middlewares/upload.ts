import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from '../errorHelpers/AppError';
import httpStatus from 'http-status-codes';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${fileExtension}`);
  }
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError(httpStatus.BAD_REQUEST, 'Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Export single file upload middleware for profile picture
export const uploadProfilePicture = upload.single('picture');

// Error handling middleware for multer errors
export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      throw new AppError(httpStatus.BAD_REQUEST, 'File too large. Maximum size allowed is 5MB.');
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Too many files. Only one file is allowed.');
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Unexpected field name. Use "picture" as field name.');
    }
  }
  next(error);
};
