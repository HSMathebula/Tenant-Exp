import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from '../middleware/error.middleware';

export class UploadService {
  private static readonly UPLOAD_DIR = 'uploads';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  private static storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const dir = path.join(process.cwd(), this.UPLOAD_DIR);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  private static fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (this.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'Invalid file type'));
    }
  };

  static upload = multer({
    storage: this.storage,
    fileFilter: this.fileFilter,
    limits: {
      fileSize: this.MAX_FILE_SIZE
    }
  });

  static async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(process.cwd(), this.UPLOAD_DIR, filename);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new AppError(500, 'Failed to delete file');
    }
  }

  static getFileUrl(filename: string): string {
    return `${process.env.API_URL}/uploads/${filename}`;
  }
} 