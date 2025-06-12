import { AppDataSource } from '../data-source';
import { Document } from '../models/Document';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export class DocumentService {
  private static s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  private static bucketName = process.env.AWS_S3_BUCKET || 'tenant-experience-documents';

  static async getUploadUrl(
    userId: string,
    documentType: string,
    fileName: string,
    contentType: string
  ): Promise<{ uploadUrl: string; documentId: string }> {
    const documentRepository = AppDataSource.getRepository(Document);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const documentId = uuidv4();
    const key = `${userId}/${documentType}/${documentId}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    const document = documentRepository.create({
      id: documentId,
      user: { id: userId },
      type: documentType,
      fileName,
      contentType,
      status: 'PENDING',
      s3Key: key,
    });

    await documentRepository.save(document);

    return { uploadUrl, documentId };
  }

  static async confirmUpload(documentId: string): Promise<Document> {
    const documentRepository = AppDataSource.getRepository(Document);

    const document = await documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });

    if (!document) {
      throw new AppError(404, 'Document not found');
    }

    document.status = 'UPLOADED';
    document.uploadedAt = new Date();

    return documentRepository.save(document);
  }

  static async getDocuments(userId: string): Promise<Document[]> {
    const documentRepository = AppDataSource.getRepository(Document);

    return documentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  static async getDocument(documentId: string, userId: string): Promise<Document> {
    const documentRepository = AppDataSource.getRepository(Document);

    const document = await documentRepository.findOne({
      where: { id: documentId, user: { id: userId } },
    });

    if (!document) {
      throw new AppError(404, 'Document not found');
    }

    return document;
  }

  static async deleteDocument(documentId: string, userId: string): Promise<void> {
    const documentRepository = AppDataSource.getRepository(Document);

    const document = await documentRepository.findOne({
      where: { id: documentId, user: { id: userId } },
    });

    if (!document) {
      throw new AppError(404, 'Document not found');
    }

    // Delete from S3
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: document.s3Key,
    });

    await this.s3Client.send(command);

    // Delete from database
    await documentRepository.remove(document);
  }
} 