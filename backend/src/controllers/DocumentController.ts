import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Document, DocumentType, DocumentStatus } from '../models/Document';
import { User, UserRole } from '../models/User';
import { Property } from '../models/Property';
import { Unit } from '../models/Unit';
import { validate } from 'class-validator';
import { FindOptionsWhere, Equal } from 'typeorm';

export class DocumentController {
  static async create(req: Request, res: Response) {
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const propertyRepository = AppDataSource.getRepository(Property);
      const unitRepository = AppDataSource.getRepository(Unit);
      const userRepository = AppDataSource.getRepository(User);
      const { propertyId, unitId, type, title, description, fileUrl, metadata, status } = req.body;

      // Get property
      const property = await propertyRepository.findOne({
        where: { id: propertyId },
        relations: ['manager']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Get unit if provided
      let unit = null;
      if (unitId) {
        unit = await unitRepository.findOne({
          where: { id: unitId },
          relations: ['property']
        });

        if (!unit) {
          return res.status(404).json({ message: 'Unit not found' });
        }

        // Verify unit belongs to property
        if (unit.property.id !== propertyId) {
          return res.status(400).json({ message: 'Unit does not belong to the specified property' });
        }
      }

      // Verify user has permission
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      if (property.manager.id !== userId && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Only property managers and admins can create documents' });
      }

      // Get uploader
      const uploader = await userRepository.findOne({ where: { id: userId } });
      if (!uploader) {
        return res.status(404).json({ message: 'Uploader not found' });
      }

      // Create document
      const document = new Document();
      document.type = type;
      document.title = title;
      document.description = description;
      document.fileUrl = fileUrl;
      document.metadata = metadata;
      document.status = status || DocumentStatus.ACTIVE;
      document.property = property;
      document.unit = unit;
      document.uploadedBy = uploader;

      // Validate document
      const errors = await validate(document);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save document
      await documentRepository.save(document);

      return res.status(201).json({
        message: 'Document created successfully',
        document
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating document', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const { propertyId, unitId, type, status } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const whereClause: FindOptionsWhere<Document> = {};
      if (propertyId) {
        whereClause.property = { id: propertyId as string };
      }
      if (unitId) {
        whereClause.unit = { id: unitId as string };
      }
      if (type) {
        whereClause.type = Equal(type as unknown as DocumentType);
      }
      if (status) {
        whereClause.status = Equal(status as unknown as DocumentStatus);
      }

      // If user is a tenant, only show documents for their unit
      if (userRole === UserRole.TENANT) {
        whereClause.unit = { currentTenant: { id: userId } };
      }

      const documents = await documentRepository.find({
        where: whereClause,
        relations: ['property', 'unit', 'uploader'],
        order: { createdAt: 'DESC' }
      });

      return res.json({ documents });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching documents', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const document = await documentRepository.findOne({
        where: { id },
        relations: ['property', 'unit', 'unit.currentTenant', 'uploader']
      });

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Verify user has access
      if (userRole === UserRole.TENANT) {
        if (!document.unit || document.unit.currentTenant?.id !== userId) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      return res.json({ document });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching document', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const document = await documentRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager', 'uploader']
      });

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Verify user has permission to update
      if (document.property.manager.id !== userId && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Only property managers and admins can update documents' });
      }

      // Update document fields
      Object.assign(document, updates);

      // Validate updates
      const errors = await validate(document);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save updates
      await documentRepository.save(document);

      return res.json({
        message: 'Document updated successfully',
        document
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating document', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const document = await documentRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager']
      });

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Verify user has permission to delete
      if (document.property.manager.id !== userId && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Only property managers and admins can delete documents' });
      }

      await documentRepository.remove(document);

      return res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting document', error });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const document = await documentRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager']
      });

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Verify user has permission to update status
      if (document.property.manager.id !== userId && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Only property managers and admins can update document status' });
      }

      // Update status
      document.status = status;
      await documentRepository.save(document);

      return res.json({
        message: 'Document status updated successfully',
        document
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating document status', error });
    }
  }

  static async upload(req: Request, res: Response) {
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const document = documentRepository.create(req.body);
      
      const errors = await validate(document);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      await documentRepository.save(document);
      return res.status(201).json({ document });
    } catch (error) {
      return res.status(500).json({ message: 'Error uploading document', error });
    }
  }

  static async getAllDocuments(req: Request, res: Response) {
    try {
      const documentRepository = AppDataSource.getRepository(Document);
      const documents = await documentRepository.find({
        relations: ['user', 'property']
      });
      return res.json({ documents });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching all documents', error });
    }
  }
} 