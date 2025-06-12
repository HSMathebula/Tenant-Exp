import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Payment, PaymentStatus } from '../models/Payment';
import { UserRole } from '../models/User';
import { Unit } from '../models/Unit';
import { Lease } from '../models/Lease';
import { validate } from 'class-validator';
import { AppError } from '../middleware/error.middleware';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

export class PaymentController {
  static async create(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const unitRepository = AppDataSource.getRepository(Unit);
      const leaseRepository = AppDataSource.getRepository(Lease);
      const { unitId, leaseId, type, method, amount, dueDate, paymentDetails } = req.body;

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
        return res.status(403).json({ message: 'Only the tenant can create payments' });
      }

      // Get lease if provided
      let lease = null;
      if (leaseId) {
        lease = await leaseRepository.findOne({
          where: { id: leaseId },
          relations: ['tenant']
        });

        if (!lease || lease.tenant.id !== userId) {
          return res.status(400).json({ message: 'Invalid lease' });
        }
      }

      // Create payment
      const payment = new Payment();
      payment.referenceNumber = `PAY-${Date.now()}`;
      payment.type = type;
      payment.method = method;
      payment.amount = amount;
      payment.dueDate = dueDate;
      payment.paymentDetails = paymentDetails;
      payment.status = PaymentStatus.PENDING;
      payment.tenant = unit.currentTenant;
      payment.unit = unit;
      if (lease) {
        payment.lease = lease;
      }

      // Validate payment
      const errors = await validate(payment);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save payment
      await paymentRepository.save(payment);

      // Notify property manager
      await NotificationService.createNotification(
        userId,
        'New Payment',
        `A new payment of $${amount} has been initiated`,
        'payment',
        payment.id
      );

      return res.status(201).json({
        message: 'Payment created successfully',
        payment
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating payment', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      let payments;
      if (userRole === UserRole.TENANT) {
        payments = await paymentRepository.find({
          where: { tenant: { id: userId } },
          relations: ['unit', 'lease']
        });
      } else {
        payments = await paymentRepository.find({
          relations: ['tenant', 'unit', 'lease']
        });
      }

      return res.json({ payments });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching payments', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const payment = await paymentRepository.findOne({
        where: { id },
        relations: ['tenant', 'unit', 'lease']
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Verify user has access
      if (userRole === UserRole.TENANT && payment.tenant.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ payment });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching payment', error });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const { id } = req.params;
      const { status, paidDate, receipts } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const payment = await paymentRepository.findOne({
        where: { id },
        relations: ['tenant', 'unit', 'unit.building', 'unit.building.manager']
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Verify user has permission to update
      if (userRole === UserRole.TENANT && payment.tenant.id !== userId) {
        return res.status(403).json({ message: 'Only the tenant can update this payment' });
      }

      if (userRole === UserRole.PROPERTY_MANAGER && payment.unit.building.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can update this payment' });
      }

      // Update payment status
      payment.status = status;
      if (status === PaymentStatus.COMPLETED) {
        payment.paidDate = paidDate || new Date();
        payment.receipts = receipts || [];
      }

      // Save updates
      await paymentRepository.save(payment);

      // Notify user
      if (!userId) {
        throw new AppError(400, 'User ID is required for notification');
      }
      await NotificationService.createNotification(
        userId,
        'Payment Status Update',
        `Your payment of $${payment.amount} has been ${status}`,
        'payment',
        payment.id
      );

      // Send email notification
      if (status === PaymentStatus.COMPLETED && payment.tenant.email) {
        await EmailService.sendPaymentConfirmationEmail(
          payment.tenant.email,
          payment.amount,
          new Date()
        );
      }

      return res.json({
        message: 'Payment status updated successfully',
        payment
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating payment status', error });
    }
  }

  static async addLateFee(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const { id } = req.params;
      const { lateFee } = req.body;
      const userId = req.user?.userId;

      const payment = await paymentRepository.findOne({
        where: { id },
        relations: ['unit', 'unit.building', 'unit.building.manager']
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Verify user is the property manager
      if (payment.unit.building.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can add late fees' });
      }

      // Add late fee
      payment.lateFee = lateFee;
      await paymentRepository.save(payment);

      return res.json({
        message: 'Late fee added successfully',
        payment
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error adding late fee', error });
    }
  }

  static async getPaymentHistory(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const { unitId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const payments = await paymentRepository.find({
        where: { unit: { id: unitId } },
        relations: ['tenant', 'lease'],
        order: { createdAt: 'DESC' }
      });

      if (userRole === UserRole.TENANT) {
        // Filter payments for tenant
        const tenantPayments = payments.filter(payment => payment.tenant.id === userId);
        return res.json({ payments: tenantPayments });
      }

      return res.json({ payments });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching payment history', error });
    }
  }

  static async getMyPayments(req: Request, res: Response) {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const paymentRepository = AppDataSource.getRepository(Payment);
    const payments = await paymentRepository.find({
      where: { tenant: { id: req.user.userId } },
      order: { createdAt: 'DESC' }
    });

    res.json(payments);
  }

  static async verifyPayment(req: Request, res: Response) {
    const paymentRepository = AppDataSource.getRepository(Payment);
    const { verificationCode } = req.body;

    const payment = await paymentRepository.findOne({
      where: { id: req.params.id },
      relations: ['tenant']
    });

    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    // Verify payment with payment provider
    // This is a placeholder for actual payment verification logic
    const isValid = verificationCode === '123456'; // Replace with actual verification

    if (!isValid) {
      throw new AppError(400, 'Invalid verification code');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.paidDate = new Date();
    await paymentRepository.save(payment);

    // Notify user
    await NotificationService.createNotification(
      payment.tenant.id,
      'Payment Verified',
      `Your payment of $${payment.amount} has been verified`,
      'payment',
      payment.id
    );

    // Send confirmation email
    if (payment.tenant.email) {
      await EmailService.sendPaymentConfirmationEmail(
        payment.tenant.email,
        payment.amount,
        new Date()
      );
    }

    res.json(payment);
  }

  static async update(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const payment = await paymentRepository.findOne({
        where: { id },
        relations: ['tenant', 'unit', 'unit.building', 'unit.building.manager']
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Verify user has permission to update
      if (userRole === UserRole.TENANT && payment.tenant.id !== userId) {
        return res.status(403).json({ message: 'Only the tenant can update this payment' });
      }

      if (userRole === UserRole.PROPERTY_MANAGER && payment.unit.building.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can update this payment' });
      }

      // Update payment
      Object.assign(payment, updates);
      await paymentRepository.save(payment);

      return res.json({
        message: 'Payment updated successfully',
        payment
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating payment', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const payment = await paymentRepository.findOne({
        where: { id },
        relations: ['tenant', 'unit', 'unit.building', 'unit.building.manager']
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Verify user has permission to delete
      if (userRole === UserRole.TENANT && payment.tenant.id !== userId) {
        return res.status(403).json({ message: 'Only the tenant can delete this payment' });
      }

      if (userRole === UserRole.PROPERTY_MANAGER && payment.unit.building.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the property manager can delete this payment' });
      }

      await paymentRepository.remove(payment);
      return res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting payment', error });
    }
  }

  static async getAllPayments(req: Request, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payments = await paymentRepository.find({
        relations: ['tenant', 'unit', 'lease'],
        order: { createdAt: 'DESC' }
      });
      return res.json({ payments });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching all payments', error });
    }
  }
} 