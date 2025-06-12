import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { EventRegistration, RegistrationStatus } from '../models/EventRegistration';
import { Event } from '../models/Event';
import { UserRole, User } from '../models/User';
import { validate } from 'class-validator';
import { NotificationService } from '../services/notification.service';
import { NotificationType } from '../models/Notification';

export class EventRegistrationController {
  static async create(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const registrationRepository = AppDataSource.getRepository(EventRegistration);
      const eventRepository = AppDataSource.getRepository(Event);
      const userRepository = AppDataSource.getRepository(User);
      const { eventId, guestInfo } = req.body;

      // Get user
      const user = await userRepository.findOne({
        where: { id: req.user.userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get event
      const event = await eventRepository.findOne({
        where: { id: eventId },
        relations: ['property', 'organizer']
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if event is full
      if (event.capacity && event.capacity.current >= event.capacity.max) {
        // Add to waitlist
        const registration = new EventRegistration();
        registration.status = RegistrationStatus.WAITLISTED;
        registration.guestInfo = guestInfo;
        registration.attendee = user;
        registration.event = event;
        registration.waitlist = {
          position: event.capacity.waitlist + 1,
          addedAt: new Date()
        };

        // Update event waitlist count
        event.capacity.waitlist += 1;
        await eventRepository.save(event);

        // Save registration
        await registrationRepository.save(registration);

        // Notify attendee
        await NotificationService.createNotification(
          user.id,
          'Event Waitlisted',
          `You have been added to the waitlist for ${event.title}`,
          NotificationType.EVENT,
          event.id
        );

        return res.status(201).json({
          message: 'Added to waitlist successfully',
          registration
        });
      }

      // Create registration
      const registration = new EventRegistration();
      registration.status = RegistrationStatus.CONFIRMED;
      registration.guestInfo = guestInfo;
      registration.attendee = user;
      registration.event = event;

      // Validate registration
      const errors = await validate(registration);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Update event capacity
      event.capacity.current += 1;
      await eventRepository.save(event);

      // Save registration
      await registrationRepository.save(registration);

      // Notify attendee
      await NotificationService.createNotification(
        user.id,
        'Event Registration Confirmed',
        `Your registration for ${event.title} has been confirmed`,
        NotificationType.EVENT,
        event.id
      );

      // Notify organizer
      await NotificationService.createNotification(
        event.organizer.id,
        'New Event Registration',
        `A new registration for ${event.title} has been received`,
        NotificationType.EVENT,
        event.id
      );

      return res.status(201).json({
        message: 'Registration successful',
        registration
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating registration', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const registrationRepository = AppDataSource.getRepository(EventRegistration);
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      let registrations;
      if (userRole === UserRole.TENANT) {
        registrations = await registrationRepository.find({
          where: { attendee: { id: userId } },
          relations: ['event', 'attendee']
        });
      } else {
        registrations = await registrationRepository.find({
          relations: ['event', 'attendee']
        });
      }

      return res.json({ registrations });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching registrations', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const registrationRepository = AppDataSource.getRepository(EventRegistration);
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const registration = await registrationRepository.findOne({
        where: { id },
        relations: ['event', 'attendee', 'event.organizer']
      });

      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      // Verify user has access
      if (userRole === UserRole.TENANT && registration.attendee.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ registration });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching registration', error });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const registrationRepository = AppDataSource.getRepository(EventRegistration);
      const eventRepository = AppDataSource.getRepository(Event);
      const { id } = req.params;
      const { status } = req.body;

      const registration = await registrationRepository.findOne({
        where: { id },
        relations: ['event', 'attendee', 'event.organizer']
      });

      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      // Update status
      const previousStatus = registration.status;
      registration.status = status;

      // Handle capacity updates
      if (status === RegistrationStatus.CANCELLED) {
        const event = registration.event;
        if (previousStatus === RegistrationStatus.CONFIRMED) {
          event.capacity.current -= 1;
        } else if (previousStatus === RegistrationStatus.WAITLISTED) {
          event.capacity.waitlist -= 1;
        }
        await eventRepository.save(event);
      }

      // Save updates
      await registrationRepository.save(registration);

      // Notify attendee
      await NotificationService.createNotification(
        registration.attendee.id,
        'Event Registration Update',
        `Your registration status for ${registration.event.title} has been updated to ${status}`,
        NotificationType.EVENT,
        registration.event.id
      );

      return res.json({
        message: 'Registration status updated successfully',
        registration
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating registration status', error });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const registrationRepository = AppDataSource.getRepository(EventRegistration);
      const eventRepository = AppDataSource.getRepository(Event);
      const userRepository = AppDataSource.getRepository(User);
      const { id } = req.params;
      const { reason } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const registration = await registrationRepository.findOne({
        where: { id },
        relations: ['event', 'attendee', 'event.organizer']
      });

      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      // Get user
      const user = await userRepository.findOne({
        where: { id: req.user.userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify user is the attendee
      if (registration.attendee.id !== user.id) {
        return res.status(403).json({ message: 'Only the attendee can cancel the registration' });
      }

      // Update status
      const previousStatus = registration.status;
      registration.status = RegistrationStatus.CANCELLED;
      registration.cancellation = {
        cancelledAt: new Date(),
        reason: reason || '',
        refundStatus: 'pending'
      };

      // Update event capacity
      const event = registration.event;
      if (previousStatus === RegistrationStatus.CONFIRMED) {
        event.capacity.current -= 1;
      } else if (previousStatus === RegistrationStatus.WAITLISTED) {
        event.capacity.waitlist -= 1;
      }
      await eventRepository.save(event);

      // Save updates
      await registrationRepository.save(registration);

      // Notify organizer
      await NotificationService.createNotification(
        event.organizer.id,
        'Event Registration Cancelled',
        `A registration for ${event.title} has been cancelled`,
        NotificationType.EVENT,
        event.id
      );

      return res.json({
        message: 'Registration cancelled successfully',
        registration
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error cancelling registration', error });
    }
  }
} 