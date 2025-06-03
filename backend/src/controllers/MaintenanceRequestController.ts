import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from '../models/MaintenanceRequest';
import { User, UserRole } from '../models/User';
import { Unit } from '../models/Unit';
import { validate } from 'class-validator';
import { AppError } from '../middleware/error.middleware';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

export class MaintenanceRequestController {
  static async create(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const unitRepository = AppDataSource.getRepository(Unit);
      const { unitId, title, description, category, priority, photos, location, preferredDate, preferredTimeSlot } = req.body;

      // Get tenant
      const userId = req.user?.userId;
      const unit = await unitRepository.findOne({
        where: { id: unitId },
        relations: ['currentTenant']
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      // Verify user is the tenant of the unit
      if (!unit.currentTenant || unit.currentTenant.id !== userId) {
        return res.status(403).json({ message: 'Only the tenant can create maintenance requests' });
      }

      // Create maintenance request
      const maintenanceRequest = new MaintenanceRequest();
      maintenanceRequest.requestNumber = `MR-${Date.now()}`;
      maintenanceRequest.title = title;
      maintenanceRequest.description = description;
      maintenanceRequest.category = category;
      maintenanceRequest.priority = priority || MaintenancePriority.MEDIUM;
      maintenanceRequest.photos = photos;
      maintenanceRequest.location = location;
      maintenanceRequest.preferredDate = preferredDate;
      maintenanceRequest.preferredTimeSlot = preferredTimeSlot;
      maintenanceRequest.status = MaintenanceStatus.PENDING;
      maintenanceRequest.tenant = unit.currentTenant;
      maintenanceRequest.unit = unit;

      // Validate request
      const errors = await validate(maintenanceRequest);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save request
      await maintenanceRepository.save(maintenanceRequest);

      // Notify property manager
      await NotificationService.createNotification(
        req.user!.userId,
        'New Maintenance Request',
        `A new maintenance request has been created: ${title}`,
        'maintenance',
        maintenanceRequest.id
      );

      return res.status(201).json({
        message: 'Maintenance request created successfully',
        maintenanceRequest
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating maintenance request', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      let maintenanceRequests;
      if (userRole === UserRole.TENANT) {
        maintenanceRequests = await maintenanceRepository.find({
          where: { tenant: { id: userId } },
          relations: ['unit', 'tenant', 'assignedTo']
        });
      } else {
        maintenanceRequests = await maintenanceRepository.find({
          relations: ['unit', 'tenant', 'assignedTo']
        });
      }

      return res.json({ maintenanceRequests });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching maintenance requests', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const maintenanceRequest = await maintenanceRepository.findOne({
        where: { id },
        relations: ['unit', 'tenant', 'assignedTo', 'documents']
      });

      if (!maintenanceRequest) {
        return res.status(404).json({ message: 'Maintenance request not found' });
      }

      // Verify user has access
      if (userRole === UserRole.TENANT && maintenanceRequest.tenant.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ maintenanceRequest });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching maintenance request', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const maintenanceRequest = await maintenanceRepository.findOne({
        where: { id },
        relations: ['tenant', 'unit', 'unit.property', 'unit.property.manager']
      });

      if (!maintenanceRequest) {
        return res.status(404).json({ message: 'Maintenance request not found' });
      }

      // Verify user has permission to update
      if (userRole === UserRole.TENANT && maintenanceRequest.tenant.id !== userId) {
        return res.status(403).json({ message: 'Only the tenant can update this request' });
      }

      if (userRole === UserRole.PROPERTY_MANAGER && maintenanceRequest.unit.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can update this request' });
      }

      // Update request fields
      Object.assign(maintenanceRequest, updates);

      // Validate updates
      const errors = await validate(maintenanceRequest);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save updates
      await maintenanceRepository.save(maintenanceRequest);

      // Notify tenant
      await NotificationService.createNotification(
        maintenanceRequest.tenant.id,
        'Maintenance Request Update',
        `Your maintenance request "${maintenanceRequest.title}" has been updated`,
        'maintenance',
        maintenanceRequest.id
      );

      // Send email notification
      await EmailService.sendMaintenanceUpdateEmail(
        maintenanceRequest.tenant.email,
        maintenanceRequest.id,
        maintenanceRequest.status
      );

      return res.json({
        message: 'Maintenance request updated successfully',
        maintenanceRequest
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating maintenance request', error });
    }
  }

  static async assignStaff(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const userRepository = AppDataSource.getRepository(User);
      const { id } = req.params;
      const { staffId, notes } = req.body;
      const userId = req.user?.userId;

      const maintenanceRequest = await maintenanceRepository.findOne({
        where: { id },
        relations: ['unit', 'unit.property', 'unit.property.manager']
      });

      if (!maintenanceRequest) {
        return res.status(404).json({ message: 'Maintenance request not found' });
      }

      // Verify user is the property manager
      if (maintenanceRequest.unit.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can assign staff' });
      }

      // Get staff member
      const staff = await userRepository.findOne({ where: { id: staffId } });
      if (!staff || staff.role !== UserRole.BUILDING_STAFF) {
        return res.status(400).json({ message: 'Invalid staff member' });
      }

      // Assign staff
      maintenanceRequest.assignedTo = {
        staff,
        assignedDate: new Date(),
        notes
      };
      maintenanceRequest.status = MaintenanceStatus.ASSIGNED;
      await maintenanceRepository.save(maintenanceRequest);

      // Notify staff member
      await NotificationService.createNotification(
        staffId,
        'New Maintenance Assignment',
        `You have been assigned to maintenance request: ${maintenanceRequest.title}`,
        'maintenance',
        maintenanceRequest.id
      );

      return res.json({
        message: 'Staff assigned successfully',
        maintenanceRequest
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error assigning staff', error });
    }
  }

  static async completeRequest(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const { id } = req.params;
      const { notes, cost } = req.body;
      const userId = req.user?.userId;

      const maintenanceRequest = await maintenanceRepository.findOne({
        where: { id },
        relations: ['assignedTo', 'assignedTo.staff']
      });

      if (!maintenanceRequest) {
        return res.status(404).json({ message: 'Maintenance request not found' });
      }

      // Verify user is the assigned staff member
      if (!maintenanceRequest.assignedTo || maintenanceRequest.assignedTo.staff.id !== userId) {
        return res.status(403).json({ message: 'Only the assigned staff member can complete this request' });
      }

      // Complete request
      maintenanceRequest.completion = {
        completedDate: new Date(),
        notes,
        cost,
        rating: 0,
        feedback: '',
        comments: []
      };
      maintenanceRequest.status = MaintenanceStatus.COMPLETED;
      await maintenanceRepository.save(maintenanceRequest);

      return res.json({
        message: 'Maintenance request completed successfully',
        maintenanceRequest
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error completing maintenance request', error });
    }
  }

  static async addFeedback(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const { id } = req.params;
      const { rating, feedback } = req.body;
      const userId = req.user?.userId;

      const maintenanceRequest = await maintenanceRepository.findOne({
        where: { id },
        relations: ['tenant']
      });

      if (!maintenanceRequest) {
        return res.status(404).json({ message: 'Maintenance request not found' });
      }

      // Verify user is the tenant
      if (maintenanceRequest.tenant.id !== userId) {
        return res.status(403).json({ message: 'Only the tenant can provide feedback' });
      }

      // Add feedback
      if (maintenanceRequest.completion) {
        maintenanceRequest.completion.rating = rating;
        maintenanceRequest.completion.feedback = feedback;
        await maintenanceRepository.save(maintenanceRequest);
      }

      return res.json({
        message: 'Feedback added successfully',
        maintenanceRequest
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error adding feedback', error });
    }
  }

  static async getMyRequests(req: Request, res: Response) {
    const maintenanceRequestRepository = AppDataSource.getRepository(MaintenanceRequest);
    const requests = await maintenanceRequestRepository.find({
      where: { tenant: { id: req.user!.userId } },
      order: { createdAt: 'DESC' }
    });

    res.json(requests);
  }

  static async updateStatus(req: Request, res: Response) {
    const maintenanceRequestRepository = AppDataSource.getRepository(MaintenanceRequest);
    const { status, completionNotes } = req.body;

    const request = await maintenanceRequestRepository.findOne({
      where: { id: req.params.id },
      relations: ['tenant']
    });

    if (!request) {
      throw new AppError(404, 'Maintenance request not found');
    }

    request.status = status;
    if (completionNotes) {
      request.completion = {
        ...request.completion,
        notes: completionNotes
      };
    }

    await maintenanceRequestRepository.save(request);

    // Notify tenant
    await NotificationService.createNotification(
      request.tenant.id,
      'Maintenance Request Update',
      `Your maintenance request "${request.title}" has been updated to ${status}`,
      'maintenance',
      request.id
    );

    // Send email notification
    if (request.tenant.email) {
      await EmailService.sendMaintenanceUpdateEmail(
        request.tenant.email,
        request.id,
        status
      );
    }

    res.json(request);
  }

  static async addComment(req: Request, res: Response) {
    const maintenanceRequestRepository = AppDataSource.getRepository(MaintenanceRequest);
    const { comment } = req.body;

    const request = await maintenanceRequestRepository.findOne({
      where: { id: req.params.id },
      relations: ['tenant']
    });

    if (!request) {
      throw new AppError(404, 'Maintenance request not found');
    }

    const newComment = {
      userId: req.user!.userId,
      comment,
      timestamp: new Date()
    };

    request.completion = {
      ...request.completion,
      comments: [...(request.completion?.comments || []), newComment]
    };

    await maintenanceRequestRepository.save(request);

    // Notify tenant
    await NotificationService.createNotification(
      request.tenant.id,
      'New Comment on Maintenance Request',
      `A new comment has been added to your maintenance request: ${request.title}`,
      'maintenance',
      request.id
    );

    res.json(request);
  }

  static async delete(req: Request, res: Response) {
    const maintenanceRequestRepository = AppDataSource.getRepository(MaintenanceRequest);
    const request = await maintenanceRequestRepository.findOne({
      where: { id: req.params.id }
    });

    if (!request) {
      throw new AppError(404, 'Maintenance request not found');
    }

    await maintenanceRequestRepository.remove(request);
    res.status(204).send();
  }

  static async getAssignedRequests(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const userId = req.user?.userId;

      const requests = await maintenanceRepository.find({
        where: { assignedTo: { staff: { id: userId } } },
        relations: ['property', 'unit', 'requestedBy', 'assignedTo'],
        order: { createdAt: 'DESC' }
      });

      return res.json({ requests });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching assigned requests', error });
    }
  }

  static async assignRequest(req: Request, res: Response) {
    try {
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      const userRepository = AppDataSource.getRepository(User);
      const { id } = req.params;
      const { staffId } = req.body;

      const maintenanceRequest = await maintenanceRepository.findOne({
        where: { id },
        relations: ['assignedTo']
      });

      if (!maintenanceRequest) {
        return res.status(404).json({ message: 'Maintenance request not found' });
      }

      const staff = await userRepository.findOne({ where: { id: staffId } });
      if (!staff) {
        return res.status(404).json({ message: 'Staff member not found' });
      }

      // Assign staff
      maintenanceRequest.assignedTo = {
        staff,
        assignedDate: new Date(),
        notes: ''
      };
      await maintenanceRepository.save(maintenanceRequest);

      return res.json({
        message: 'Staff assigned successfully',
        maintenanceRequest
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error assigning staff', error });
    }
  }
} 