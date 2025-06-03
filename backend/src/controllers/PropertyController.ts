import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Property } from '../models/Property';
import { User, UserRole } from '../models/User';
import { validate } from 'class-validator';

export class PropertyController {
  static async create(req: Request, res: Response) {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const userRepository = AppDataSource.getRepository(User);
      const { name, address, location, amenities, rules, photos, contactInfo, operatingHours, securityInfo } = req.body;

      // Verify user is a property manager
      const userId = req.user?.userId;
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== UserRole.PROPERTY_MANAGER) {
        return res.status(403).json({ message: 'Only property managers can create properties' });
      }

      // Create new property
      const property = new Property();
      property.name = name;
      property.address = address;
      property.location = location;
      property.amenities = amenities;
      property.rules = rules;
      property.photos = photos;
      property.contactInfo = contactInfo;
      property.operatingHours = operatingHours;
      property.securityInfo = securityInfo;
      property.manager = user;

      // Validate property
      const errors = await validate(property);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save property
      await propertyRepository.save(property);

      return res.status(201).json({
        message: 'Property created successfully',
        property
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating property', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const properties = await propertyRepository.find({
        relations: ['manager', 'units']
      });

      return res.json({ properties });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching properties', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const { id } = req.params;

      const property = await propertyRepository.findOne({
        where: { id },
        relations: ['manager', 'units', 'documents', 'events']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      return res.json({ property });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching property', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const { id } = req.params;
      const updates = req.body;

      const property = await propertyRepository.findOne({
        where: { id },
        relations: ['manager']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Verify user is the property manager
      const userId = req.user?.userId;
      if (property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can update this property' });
      }

      // Update property fields
      Object.assign(property, updates);

      // Validate updates
      const errors = await validate(property);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save updates
      await propertyRepository.save(property);

      return res.json({
        message: 'Property updated successfully',
        property
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating property', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const { id } = req.params;

      const property = await propertyRepository.findOne({
        where: { id },
        relations: ['manager']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Verify user is the property manager
      const userId = req.user?.userId;
      if (property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can delete this property' });
      }

      await propertyRepository.remove(property);

      return res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting property', error });
    }
  }

  static async getUnits(req: Request, res: Response) {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const { id } = req.params;

      const property = await propertyRepository.findOne({
        where: { id },
        relations: ['units']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      return res.json({ units: property.units });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching units', error });
    }
  }

  static async getDocuments(req: Request, res: Response) {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const { id } = req.params;

      const property = await propertyRepository.findOne({
        where: { id },
        relations: ['documents']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      return res.json({ documents: property.documents });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching documents', error });
    }
  }

  static async getEvents(req: Request, res: Response) {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const { id } = req.params;

      const property = await propertyRepository.findOne({
        where: { id },
        relations: ['events']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      return res.json({ events: property.events });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching events', error });
    }
  }
} 