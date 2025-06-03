import express from "express"
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementsByProperty,
  addAnnouncementAttachment,
} from "../controllers/announcement.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
// None

// Protected routes
router.get("/", authenticate, getAllAnnouncements)
router.get("/:id", authenticate, getAnnouncementById)
router.post("/", authenticate, authorize([UserRole.ADMIN]), createAnnouncement)
router.put("/:id", authenticate, authorize([UserRole.ADMIN]), updateAnnouncement)
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), deleteAnnouncement)
router.get("/property/:propertyId", authenticate, getAnnouncementsByProperty)
router.post("/:id/attachments", authenticate, authorize([UserRole.ADMIN]), addAnnouncementAttachment)

export default router
