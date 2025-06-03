import express from "express"
import {
  getStaffSchedule,
  updateStaffAvailability,
  assignTicket,
  getAllMaintenanceStaff,
  createMaintenanceStaff,
  updateMaintenanceStaff,
  deleteMaintenanceStaff,
} from "../controllers/schedule.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
// None

// Protected routes
router.get("/staff", authenticate, authorize([UserRole.ADMIN]), getAllMaintenanceStaff)
router.post("/staff", authenticate, authorize([UserRole.ADMIN]), createMaintenanceStaff)
router.put("/staff/:id", authenticate, authorize([UserRole.ADMIN]), updateMaintenanceStaff)
router.delete("/staff/:id", authenticate, authorize([UserRole.ADMIN]), deleteMaintenanceStaff)
router.get("/staff/:staffId", authenticate, getStaffSchedule)
router.put("/staff/:staffId/availability", authenticate, updateStaffAvailability)
router.post("/staff/:staffId/assign", authenticate, authorize([UserRole.ADMIN]), assignTicket)

export default router
