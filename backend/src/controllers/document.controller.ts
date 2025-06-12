import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { AppError } from '../middleware/error.middleware';
import { DocumentType } from '../models/Document';

export class DocumentController {
  static async getUploadUrl(req: Request, res: Response) {
    try {
      const { documentType, fileName, contentType } = req.body;
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      if (!Object.values(DocumentType).includes(documentType)) {
        throw new AppError(400, 'Invalid document type');
      }

      const { uploadUrl, documentId } = await DocumentService.getUploadUrl(
        userId,
        documentType,
        fileName,
        contentType
      );

      res.json({ uploadUrl, documentId });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async confirmUpload(req: Request, res: Response) {
    try {
      const { documentId } = req.params;
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      const document = await DocumentService.confirmUpload(documentId);
      res.json(document);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getDocuments(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      const documents = await DocumentService.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getDocument(req: Request, res: Response) {
    try {
      const { documentId } = req.params;
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      const document = await DocumentService.getDocument(documentId, userId);
      res.json(document);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async deleteDocument(req: Request, res: Response) {
    try {
      const { documentId } = req.params;
      if (!req.user) throw new AppError(401, 'User not authenticated');
      const userId = req.user.userId;

      await DocumentService.deleteDocument(documentId, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 