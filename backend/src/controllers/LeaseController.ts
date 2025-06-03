import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Lease, LeaseStatus } from '../models/Lease';
import { User, UserRole } from '../models/User';
import { Property } from '../models/Property';
import { Unit } from '../models/Unit';
import { validate } from 'class-validator';

export class LeaseController {
  static async create(req: Request, res: Response) {
    try {
      const leaseRepository = AppDataSource.getRepository(Lease);
      const propertyRepository = AppDataSource.getRepository(Property);
      const unitRepository = AppDataSource.getRepository(Unit);
      const userRepository = AppDataSource.getRepository(User);
      const { propertyId, unitId, tenantId, startDate, endDate, rentAmount, depositAmount, terms, status } = req.body;

      // Get property
      const property = await propertyRepository.findOne({
        where: { id: propertyId },
        relations: ['manager']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Get unit
      const unit = await unitRepository.findOne({
        where: { id: unitId },
        relations: ['property', 'currentTenant']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      // Verify unit belongs to property
      if (unit.property.id !== propertyId) {
        return res.status(400).json({ message: 'Unit does not belong to the specified property' });
      }

      // Check if unit is available
      if (unit.currentTenant) {
        return res.status(400).json({ message: 'Unit is already occupied' });
      }

      // Get tenant
      const tenant = await userRepository.findOne({ where: { id: tenantId } });
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      // Verify user has permission
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      if (property.manager.id !== userId && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Only property managers and admins can create leases' });
      }

      // Create lease
      const lease = new Lease();
      lease.startDate = startDate;
      lease.endDate = endDate;
      lease.rentAmount = rentAmount;
      lease.depositAmount = depositAmount;
      lease.terms = terms;
      lease.status = status || LeaseStatus.ACTIVE;
      lease.property = property;
      lease.unit = unit;
      lease.tenant = tenant;

      // Validate lease
      const errors = await validate(lease);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save lease
      await leaseRepository.save(lease);

      // Update unit's current tenant
      unit.currentTenant = tenant;
      await unitRepository.save(unit);

      return res.status(201).json({
        message: 'Lease created successfully',
        lease
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating lease', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const leaseRepository = AppDataSource.getRepository(Lease);
      const { propertyId, unitId, status } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      let whereClause: any = {};
      if (propertyId) {
        whereClause.property = { id: propertyId };
      }
      if (unitId) {
        whereClause.unit = { id: unitId };
      }
      if (status) {
        whereClause.status = status;
      }

      // If user is a tenant, only show their leases
      if (userRole === UserRole.TENANT) {
        whereClause.tenant = { id: userId };
      }

      const leases = await leaseRepository.find({
        where: whereClause,
        relations: ['property', 'unit', 'tenant'],
        order: { startDate: 'DESC' }
      });

      return res.json({ leases });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching leases', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const leaseRepository = AppDataSource.getRepository(Lease);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const lease = await leaseRepository.findOne({
        where: { id },
        relations: ['property', 'unit', 'tenant']
      });

      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Verify user has access
      if (userRole === UserRole.TENANT && lease.tenant.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ lease });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching lease', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const leaseRepository = AppDataSource.getRepository(Lease);
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const lease = await leaseRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager', 'tenant']
      });

      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Verify user has permission to update
      if (lease.property.manager.id !== userId && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Only property managers and admins can update leases' });
      }

      // Update lease fields
      Object.assign(lease, updates);

      // Validate updates
      const errors = await validate(lease);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save updates
      await leaseRepository.save(lease);

      return res.json({
        message: 'Lease updated successfully',
        lease
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating lease', error });
    }
  }

  static async terminate(req: Request, res: Response) {
    try {
      const leaseRepository = AppDataSource.getRepository(Lease);
      const unitRepository = AppDataSource.getRepository(Unit);
      const { id } = req.params;
      const { terminationDate, reason } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const lease = await leaseRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager', 'unit', 'tenant']
      });

      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Verify user has permission to terminate
      if (lease.property.manager.id !== userId && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Only property managers and admins can terminate leases' });
      }

      // Update lease status
      lease.status = LeaseStatus.TERMINATED;
      lease.terminationDate = terminationDate;
      lease.terminationReason = reason;
      await leaseRepository.save(lease);

      // Remove tenant from unit
      const unit = lease.unit;
      unit.currentTenant = null;
      await unitRepository.save(unit);

      return res.json({
        message: 'Lease terminated successfully',
        lease
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error terminating lease', error });
    }
  }

  static async renew(req: Request, res: Response) {
    try {
      const leaseRepository = AppDataSource.getRepository(Lease);
      const { id } = req.params;
      const { newEndDate, updatedTerms } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const lease = await leaseRepository.findOne({
        where: { id },
        relations: ['property', 'property.manager']
      });

      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Verify user has permission to renew
      if (lease.property.manager.id !== userId && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Only property managers and admins can renew leases' });
      }

      // Update lease end date and terms
      lease.endDate = newEndDate;
      if (updatedTerms) {
        lease.terms = updatedTerms;
      }

      // Validate updates
      const errors = await validate(lease);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save updates
      await leaseRepository.save(lease);

      return res.json({
        message: 'Lease renewed successfully',
        lease
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error renewing lease', error });
    }
  }
} 