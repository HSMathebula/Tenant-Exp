import { Router } from 'express';
import userRoutes from './user.routes';
import propertyRoutes from './property.routes';
import unitRoutes from './unit.routes';
import maintenanceRoutes from './maintenance.routes';
import paymentRoutes from './payment.routes';
import documentRoutes from './document.routes';
import eventRoutes from './event.routes';
import notificationRoutes from './notification.routes';
import buildingAssignmentRoutes from './building-assignment.routes';
import packageRoutes from './package.routes';
import amenityBookingRoutes from './amenity-booking.routes';
import eventRegistrationRoutes from './event-registration.routes';
import amenityRoutes from './amenity.routes';
import calendarRoutes from './calendar.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/units', unitRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/documents', documentRoutes);
router.use('/events', eventRoutes);
router.use('/notifications', notificationRoutes);
router.use('/building-assignments', buildingAssignmentRoutes);
router.use('/packages', packageRoutes);
router.use('/amenity-bookings', amenityBookingRoutes);
router.use('/event-registrations', eventRegistrationRoutes);
router.use('/amenities', amenityRoutes);
router.use('/calendar', calendarRoutes);

export default router; 