import { Router } from 'express';
import { CalendarEventController } from '../controllers/CalendarEventController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my events (roster/schedule)
router.get('/my-events', CalendarEventController.getMyEvents);

// Get event by ID
router.get('/events/:id', CalendarEventController.getById);

// Create new event
router.post('/events', CalendarEventController.create);

// Update event
router.put('/events/:id', CalendarEventController.update);

// Delete event
router.delete('/events/:id', CalendarEventController.delete);

export default router; 