import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { AmenityBooking, BookingStatus } from '../models/AmenityBooking';
import { UserRole, User } from '../models/User';
import { Building } from '../models/Building';
import { validate } from 'class-validator';
import { NotificationService } from '../services/notification.service';
import { BuildingAssignment } from '../models/BuildingAssignment';
import { AppError } from '../middleware/error.middleware';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { NotificationType } from '../models/Notification';

export class AmenityBookingController {
  static async create(req: Request, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);
      const buildingRepository = AppDataSource.getRepository(Building);
      const userRepository = AppDataSource.getRepository(User);
      const { propertyId, amenityName, date, startTime, endTime, guests, purpose } = req.body;

      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await userRepository.findOne({ where: { id: req.user.userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get building
      const building = await buildingRepository.findOne({
        where: { id: propertyId }
      });

      if (!building) {
        return res.status(404).json({ message: 'Building not found' });
      }

      // Check if amenity exists
      if (!building.amenities.includes(amenityName)) {
        return res.status(400).json({ message: 'Amenity not available at this building' });
      }

      // Check for booking conflicts
      const existingBookings = await bookingRepository.find({
        where: [
          {
            building: { id: propertyId },
            amenityName,
            date,
            status: BookingStatus.APPROVED,
            startTime: LessThanOrEqual(startTime),
            endTime: MoreThanOrEqual(startTime)
          },
          {
            building: { id: propertyId },
            amenityName,
            date,
            status: BookingStatus.APPROVED,
            startTime: LessThanOrEqual(endTime),
            endTime: MoreThanOrEqual(endTime)
          }
        ]
      });

      if (existingBookings.length > 0) {
        return res.status(400).json({ message: 'Time slot is already booked' });
      }

      // Create booking
      const booking = new AmenityBooking();
      booking.amenityName = amenityName;
      booking.date = new Date(date);
      booking.startTime = startTime;
      booking.endTime = endTime;
      booking.guests = guests;
      booking.purpose = purpose;
      booking.status = BookingStatus.PENDING;
      booking.user = user;
      booking.building = building;

      // Validate booking
      const errors = await validate(booking);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save booking
      await bookingRepository.save(booking);

      // Notify property manager
      await NotificationService.createNotification(
        building.manager.id,
        'New Amenity Booking Request',
        `A new booking request for ${amenityName} has been submitted`,
        NotificationType.EVENT_CREATED,
        booking.id
      );

      return res.status(201).json({
        message: 'Booking request submitted successfully',
        booking
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating booking', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      let bookings;
      if (userRole === UserRole.TENANT) {
        bookings = await bookingRepository.find({
          where: { user: { id: userId } },
          relations: ['building', 'user']
        });
      } else {
        bookings = await bookingRepository.find({
          relations: ['building', 'user']
        });
      }

      return res.json({ bookings });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching bookings', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const booking = await bookingRepository.findOne({
        where: { id },
        relations: ['property', 'tenant']
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Verify user has access
      if (userRole === UserRole.TENANT && booking.user.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ booking });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching booking', error });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const booking = await bookingRepository.findOne({
        where: { id },
        relations: ['user', 'building']
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Update status
      booking.status = status;
      if (status === BookingStatus.APPROVED) {
        booking.approval = {
          approvedBy: req.user.userId,
          approvedAt: new Date(),
          notes: notes || ''
        };
      } else if (status === BookingStatus.CANCELLED) {
        booking.cancellation = {
          cancelledBy: req.user.userId,
          cancelledAt: new Date(),
          reason: notes || ''
        };
      }

      // Save updates
      await bookingRepository.save(booking);

      // Notify tenant
      await NotificationService.createNotification(
        booking.user.id,
        'Amenity Booking Update',
        `Your booking for ${booking.amenityName} has been ${status.toLowerCase()}`,
        NotificationType.EVENT_UPDATED,
        booking.id
      );

      return res.json({
        message: 'Booking status updated successfully',
        booking
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating booking status', error });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);
      const { id } = req.params;
      const { reason } = req.body;

      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const booking = await bookingRepository.findOne({
        where: { id },
        relations: ['user', 'building']
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Verify user is the tenant
      if (booking.user.id !== req.user.userId) {
        return res.status(403).json({ message: 'Only the tenant can cancel the booking' });
      }

      // Update status
      booking.status = BookingStatus.CANCELLED;
      booking.cancellation = {
        cancelledBy: req.user.userId,
        cancelledAt: new Date(),
        reason: reason || ''
      };

      // Save updates
      await bookingRepository.save(booking);

      // Notify property manager
      await NotificationService.createNotification(
        booking.building.manager.id,
        'Amenity Booking Cancelled',
        `A booking for ${booking.amenityName} has been cancelled`,
        NotificationType.EVENT_CANCELLED,
        booking.id
      );

      return res.json({
        message: 'Booking cancelled successfully',
        booking
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error cancelling booking', error });
    }
  }

  static async createBooking(req: Request, res: Response) {
    try {
      const { buildingId, amenityId, startTime, endTime, purpose } = req.body;
      const userId = req.user?.userId;
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);
      const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

      // Verify user has access to the building
      const assignment = await buildingAssignmentRepository.findOne({
        where: {
          user: { id: userId },
          building: { id: buildingId },
          isActive: true
        }
      });

      if (!assignment) {
        throw new AppError(403, 'User does not have access to this building');
      }

      // Check for conflicting bookings
      const conflictingBooking = await bookingRepository.findOne({
        where: {
          building: { id: buildingId },
          amenityName: amenityId,
          startTime: startTime,
          endTime: endTime,
          status: BookingStatus.APPROVED
        }
      });

      if (conflictingBooking) {
        throw new AppError(400, 'This time slot is already booked');
      }

      const booking = bookingRepository.create({
        building: { id: buildingId },
        amenityName: amenityId,
        startTime,
        endTime,
        purpose,
        user: { id: userId },
        status: BookingStatus.PENDING
      });

      await bookingRepository.save(booking);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error creating booking' });
      }
    }
  }

  static async getUserBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);

      const bookings = await bookingRepository.find({
        where: { user: { id: userId } },
        relations: ['building'],
        order: { startTime: 'DESC' }
      });

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user bookings' });
    }
  }

  static async getBuildingBookings(req: Request, res: Response) {
    try {
      const { buildingId } = req.params;
      const userId = req.user?.userId;
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);
      const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

      // Verify user has access to the building
      const assignment = await buildingAssignmentRepository.findOne({
        where: {
          user: { id: userId },
          building: { id: buildingId },
          isActive: true
        }
      });

      if (!assignment) {
        throw new AppError(403, 'User does not have access to this building');
      }

      const bookings = await bookingRepository.find({
        where: { building: { id: buildingId } },
        relations: ['user'],
        order: { startTime: 'DESC' }
      });

      res.json(bookings);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error fetching building bookings' });
      }
    }
  }

  static async updateBookingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);
      const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

      const booking = await bookingRepository.findOne({
        where: { id },
        relations: ['building']
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // Verify user has access to the building
      const assignment = await buildingAssignmentRepository.findOne({
        where: {
          user: { id: userId },
          building: { id: booking.building.id },
          isActive: true
        }
      });

      if (!assignment) {
        throw new AppError(403, 'User does not have access to this booking');
      }

      booking.status = status;
      await bookingRepository.save(booking);
      res.json(booking);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error updating booking status' });
      }
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const bookingRepository = AppDataSource.getRepository(AmenityBooking);

      const booking = await bookingRepository.findOne({
        where: { id },
        relations: ['building']
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // Verify user is the booking owner
      if (booking.user.id !== userId) {
        throw new AppError(403, 'Only the booking owner can cancel this booking');
      }

      booking.status = BookingStatus.CANCELLED;
      await bookingRepository.save(booking);
      res.json(booking);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error cancelling booking' });
      }
    }
  }
} 