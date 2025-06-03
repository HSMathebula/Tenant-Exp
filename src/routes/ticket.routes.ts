import express from "express"
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addTicketNote,
  addTicketImage,
  addTicketMaterials,
  getTicketsByTenant,
  getTicketsByProperty,
  getTicketsByStaff,
} from "../controllers/ticket.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
// None

// Protected routes
router.get("/", authenticate, getAllTickets)
router.get("/:id", authenticate, getTicketById)
router.post("/", authenticate, createTicket)
router.put("/:id", authenticate, updateTicket)
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), deleteTicket)
router.post("/:id/notes", authenticate, addTicketNote)
router.post("/:id/images", authenticate, addTicketImage)
router.post("/:id/materials", authenticate, authorize([UserRole.MAINTENANCE, UserRole.ADMIN]), addTicketMaterials)
router.get("/tenant/:tenantId", authenticate, getTicketsByTenant)
router.get("/property/:propertyId", authenticate, getTicketsByProperty)
router.get("/staff/:staffId", authenticate, getTicketsByStaff)

export default router
