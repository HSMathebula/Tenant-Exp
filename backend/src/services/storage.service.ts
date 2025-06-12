import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { AppError } from '../middleware/error.middleware';

export class StorageService {
  private s3: S3;
  private bucket: string;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.bucket = process.env.AWS_S3_BUCKET || '';
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  ): Promise<{ url: string; key: string }> {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type', 400);
    }

    const fileExtension = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    const params: S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      const result = await this.s3.upload(params).promise();
      return {
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new AppError('Failed to upload file', 500);
    }
  }

  async uploadStream(
    stream: Readable,
    filename: string,
    mimeType: string,
    folder: string = 'uploads'
  ): Promise<{ url: string; key: string }> {
    const key = `${folder}/${uuidv4()}-${filename}`;

    const params: S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: stream,
      ContentType: mimeType,
      ACL: 'public-read'
    };

    try {
      const result = await this.s3.upload(params).promise();
      return {
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      console.error('Error uploading stream to S3:', error);
      throw new AppError('Failed to upload file', 500);
    }
  }

  async deleteFile(key: string): Promise<void> {
    const params: S3.DeleteObjectRequest = {
      Bucket: this.bucket,
      Key: key
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new AppError('Failed to delete file', 500);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params: S3.GetSignedUrlRequest = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn
    };

    try {
      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new AppError('Failed to generate signed URL', 500);
    }
  }

  async getFileMetadata(key: string): Promise<S3.HeadObjectOutput> {
    const params: S3.HeadObjectRequest = {
      Bucket: this.bucket,
      Key: key
    };

    try {
      return await this.s3.headObject(params).promise();
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new AppError('Failed to get file metadata', 500);
    }
  }

  async listFiles(prefix: string = '', maxKeys: number = 1000): Promise<S3.ListObjectsV2Output> {
    const params: S3.ListObjectsV2Request = {
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: maxKeys
    };

    try {
      return await this.s3.listObjectsV2(params).promise();
    } catch (error) {
      console.error('Error listing files:', error);
      throw new AppError('Failed to list files', 500);
    }
  }
} 