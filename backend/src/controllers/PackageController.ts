import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Package, PackageStatus } from '../models/Package';
import { User, UserRole } from '../models/User';
import { Property } from '../models/Property';
import { validate } from 'class-validator';
import { AppError } from '../middleware/error.middleware';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

export class PackageController {
  static async create(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(Package);
      const propertyRepository = AppDataSource.getRepository(Property);
      const { propertyId, trackingNumber, carrier, details } = req.body;

      // Get property
      const property = await propertyRepository.findOne({
        where: { id: propertyId }
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Create package
      const pkg = new Package();
      pkg.trackingNumber = trackingNumber;
      pkg.carrier = carrier;
      pkg.details = details;
      pkg.status = PackageStatus.RECEIVED;
      pkg.property = property;
      pkg.receivedBy = req.user!;

      // Validate package
      const errors = await validate(pkg);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save package
      await packageRepository.save(pkg);

      // Notify recipient
      if (details.recipient) {
        await NotificationService.createNotification(
          details.recipient,
          'New Package Received',
          `A new package has been received for you at ${property.name}`,
          'package',
          pkg.id
        );

        // Send email notification
        await EmailService.sendPackageNotificationEmail(
          details.recipient,
          pkg.id,
          property.name
        );
      }

      return res.status(201).json({
        message: 'Package created successfully',
        package: pkg
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating package', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(Package);
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      let packages;
      if (userRole === UserRole.TENANT) {
        packages = await packageRepository.find({
          where: { recipient: { id: userId } },
          relations: ['property', 'recipient', 'receivedBy']
        });
      } else {
        packages = await packageRepository.find({
          relations: ['property', 'recipient', 'receivedBy']
        });
      }

      return res.json({ packages });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching packages', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(Package);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const pkg = await packageRepository.findOne({
        where: { id },
        relations: ['property', 'recipient', 'receivedBy']
      });

      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Verify user has access
      if (userRole === UserRole.TENANT && pkg.recipient?.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ package: pkg });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching package', error });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(Package);
      const { id } = req.params;
      const { status, notes } = req.body;

      const pkg = await packageRepository.findOne({
        where: { id },
        relations: ['recipient', 'property']
      });

      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Update status
      pkg.status = status;
      if (status === PackageStatus.PICKED_UP) {
        pkg.pickup = {
          pickedUpAt: new Date(),
          pickedUpBy: req.user!.id,
          notes: notes || ''
        };
      }

      // Save updates
      await packageRepository.save(pkg);

      // Notify recipient
      if (pkg.recipient) {
        await NotificationService.createNotification(
          pkg.recipient.id,
          'Package Status Update',
          `Your package status has been updated to ${status}`,
          'package',
          pkg.id
        );

        // Send email notification
        await EmailService.sendPackageStatusUpdateEmail(
          pkg.recipient.email,
          pkg.id,
          status
        );
      }

      return res.json({
        message: 'Package status updated successfully',
        package: pkg
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating package status', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(Package);
      const { id } = req.params;

      const pkg = await packageRepository.findOne({
        where: { id },
        relations: ['recipient']
      });

      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Delete package
      await packageRepository.remove(pkg);

      return res.json({ message: 'Package deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting package', error });
    }
  }
} 