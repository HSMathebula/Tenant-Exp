import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Unit, UnitStatus } from '../models/Unit';
import { Property } from '../models/Property';
import { User, UserRole } from '../models/User';
import { validate } from 'class-validator';

export class UnitController {
  static async create(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const propertyRepository = AppDataSource.getRepository(Property);
      const { propertyId, unitNumber, floor, squareFootage, monthlyRent, deposit, features, photos, floorPlan, utilities } = req.body;

      // Verify user is a property manager
      const userId = req.user?.userId;
      const property = await propertyRepository.findOne({
        where: { id: propertyId },
        relations: ['manager']
      });

      if (!property || property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only property managers can create units' });
      }

      // Create new unit
      const unit = new Unit();
      unit.unitNumber = unitNumber;
      unit.floor = floor;
      unit.squareFootage = squareFootage;
      unit.monthlyRent = monthlyRent;
      unit.deposit = deposit;
      unit.features = features;
      unit.photos = photos;
      unit.floorPlan = floorPlan;
      unit.utilities = utilities;
      unit.property = property;
      unit.status = UnitStatus.AVAILABLE;

      // Validate unit
      const errors = await validate(unit);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save unit
      await unitRepository.save(unit);

      return res.status(201).json({
        message: 'Unit created successfully',
        unit
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating unit', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const units = await unitRepository.find({
        relations: ['property', 'currentTenant']
      });

      return res.json({ units });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching units', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const { id } = req.params;

      const unit = await unitRepository.findOne({
        where: { id },
        relations: ['property', 'currentTenant', 'maintenanceRequests', 'payments']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      return res.json({ unit });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching unit', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const propertyRepository = AppDataSource.getRepository(Property);
      const { id } = req.params;
      const updates = req.body;

      const unit = await unitRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      // Verify user is the property manager
      const userId = req.user?.userId;
      if (unit.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can update this unit' });
      }

      // Update unit fields
      Object.assign(unit, updates);

      // Validate updates
      const errors = await validate(unit);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save updates
      await unitRepository.save(unit);

      return res.json({
        message: 'Unit updated successfully',
        unit
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating unit', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const { id } = req.params;

      const unit = await unitRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      // Verify user is the property manager
      const userId = req.user?.userId;
      if (unit.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can delete this unit' });
      }

      await unitRepository.remove(unit);

      return res.json({ message: 'Unit deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting unit', error });
    }
  }

  static async assignTenant(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const userRepository = AppDataSource.getRepository(User);
      const { id } = req.params;
      const { tenantId } = req.body;

      const unit = await unitRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager', 'currentTenant']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      // Verify user is the property manager
      const userId = req.user?.userId;
      if (unit.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can assign tenants' });
      }

      // Check if unit is available
      if (unit.status !== UnitStatus.AVAILABLE) {
        return res.status(400).json({ message: 'Unit is not available for assignment' });
      }

      // Get tenant
      const tenant = await userRepository.findOne({ where: { id: tenantId } });
      if (!tenant || tenant.role !== UserRole.TENANT) {
        return res.status(400).json({ message: 'Invalid tenant' });
      }

      // Assign tenant
      unit.currentTenant = tenant;
      unit.status = UnitStatus.OCCUPIED;
      await unitRepository.save(unit);

      return res.json({
        message: 'Tenant assigned successfully',
        unit
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error assigning tenant', error });
    }
  }

  static async removeTenant(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const { id } = req.params;

      const unit = await unitRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager', 'currentTenant']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      // Verify user is the property manager
      const userId = req.user?.userId;
      if (unit.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can remove tenants' });
      }

      // Check if unit has a tenant
      if (!unit.currentTenant) {
        return res.status(400).json({ message: 'Unit has no tenant assigned' });
      }

      // Remove tenant
      unit.currentTenant = null;
      unit.status = UnitStatus.AVAILABLE;
      await unitRepository.save(unit);

      return res.json({
        message: 'Tenant removed successfully',
        unit
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error removing tenant', error });
    }
  }

  static async getMaintenanceRequests(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const { id } = req.params;

      const unit = await unitRepository.findOne({
        where: { id },
        relations: ['maintenanceRequests']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      return res.json({ maintenanceRequests: unit.maintenanceRequests });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching maintenance requests', error });
    }
  }

  static async getPayments(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      const { id } = req.params;

      const unit = await unitRepository.findOne({
        where: { id },
        relations: ['payments']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      return res.json({ payments: unit.payments });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching payments', error });
    }
  }
} 