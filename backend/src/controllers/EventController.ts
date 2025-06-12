import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Event, EventType, EventStatus } from '../models/Event';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { validate } from 'class-validator';
import { FindOptionsWhere } from 'typeorm';

export class EventController {
  static async create(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const propertyRepository = AppDataSource.getRepository(Property);
      const userRepository = AppDataSource.getRepository(User);
      const { propertyId, title, description, type, startDate, endDate, photos, location, capacity, requirements, contact, tags } = req.body;

      // Get property
      const property = await propertyRepository.findOne({
        where: { id: propertyId },
        relations: ['manager']
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Verify user is the property manager
      const userId = req.user?.userId;
      if (property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only property managers can create events' });
      }

      // Get organizer
      const organizer = await userRepository.findOne({ where: { id: userId } });
      if (!organizer) {
        return res.status(404).json({ message: 'Organizer not found' });
      }

      // Create event
      const event = new Event();
      event.title = title;
      event.description = description;
      event.type = type;
      event.status = EventStatus.SCHEDULED;
      event.startDate = startDate;
      event.endDate = endDate;
      event.photos = photos;
      event.location = location;
      event.capacity = capacity;
      event.requirements = requirements;
      event.contact = contact;
      event.tags = tags;
      event.organizer = organizer;
      event.property = property;

      // Validate event
      const errors = await validate(event);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save event
      await eventRepository.save(event);

      return res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating event', error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const { propertyId, type, status } = req.query;

      const whereClause: FindOptionsWhere<Event> = {};
      if (propertyId) {
        whereClause.property = { id: propertyId as string };
      }
      if (type) {
        whereClause.type = type as EventType;
      }
      if (status) {
        whereClause.status = status as EventStatus;
      }

      const events = await eventRepository.find({
        where: whereClause,
        relations: ['organizer', 'property', 'attendees'],
        order: { startDate: 'ASC' }
      });

      return res.json({ events });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching events', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const { id } = req.params;

      const event = await eventRepository.findOne({
        where: { id },
        relations: ['organizer', 'property', 'attendees']
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      return res.json({ event });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching event', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;

      const event = await eventRepository.findOne({
        where: { id },
        relations: ['organizer', 'property', 'property.manager']
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Verify user has permission to update
      if (event.organizer.id !== userId && event.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the organizer or property manager can update this event' });
      }

      // Update event fields
      Object.assign(event, updates);

      // Validate updates
      const errors = await validate(event);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Save updates
      await eventRepository.save(event);

      return res.json({
        message: 'Event updated successfully',
        event
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating event', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const { id } = req.params;
      const userId = req.user?.userId;

      const event = await eventRepository.findOne({
        where: { id },
        relations: ['organizer', 'property', 'property.manager']
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Verify user has permission to delete
      if (event.organizer.id !== userId && event.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the organizer or property manager can delete this event' });
      }

      await eventRepository.remove(event);

      return res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting event', error });
    }
  }

  static async registerAttendee(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const userRepository = AppDataSource.getRepository(User);
      const { id } = req.params;
      const userId = req.user?.userId;

      const event = await eventRepository.findOne({
        where: { id },
        relations: ['attendees', 'capacity']
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if event is full
      if (event.capacity && event.capacity.current >= event.capacity.max) {
        return res.status(400).json({ message: 'Event is full' });
      }

      // Get user
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is already registered
      if (event.attendees.some(attendee => attendee.id === userId)) {
        return res.status(400).json({ message: 'User is already registered for this event' });
      }

      // Register attendee
      event.attendees.push(user);
      if (event.capacity) {
        event.capacity.current += 1;
      }
      await eventRepository.save(event);

      return res.json({
        message: 'Successfully registered for event',
        event
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error registering for event', error });
    }
  }

  static async unregisterAttendee(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const { id } = req.params;
      const userId = req.user?.userId;

      const event = await eventRepository.findOne({
        where: { id },
        relations: ['attendees', 'capacity']
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is registered
      const attendeeIndex = event.attendees.findIndex(attendee => attendee.id === userId);
      if (attendeeIndex === -1) {
        return res.status(400).json({ message: 'User is not registered for this event' });
      }

      // Unregister attendee
      event.attendees.splice(attendeeIndex, 1);
      if (event.capacity) {
        event.capacity.current -= 1;
      }
      await eventRepository.save(event);

      return res.json({
        message: 'Successfully unregistered from event',
        event
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error unregistering from event', error });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;

      const event = await eventRepository.findOne({
        where: { id },
        relations: ['organizer', 'property', 'property.manager']
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Verify user has permission to update status
      if (event.organizer.id !== userId && event.property.manager.id !== userId) {
        return res.status(403).json({ message: 'Only the organizer or property manager can update event status' });
      }

      // Update status
      event.status = status;
      await eventRepository.save(event);

      return res.json({
        message: 'Event status updated successfully',
        event
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating event status', error });
    }
  }

  static async getPublicEvents(req: Request, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const events = await eventRepository.find({
        where: { type: EventType.COMMUNITY },
        order: { startDate: 'ASC' }
      });
      return res.json({ events });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching public events', error });
    }
  }
} 