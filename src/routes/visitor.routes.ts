import express from "express"
import {
  getAllVisitorAccess,
  getVisitorAccessById,
  createVisitorAccess,
  updateVisitorAccess,
  deleteVisitorAccess,
  getVisitorAccessByTenant,
  verifyVisitorAccessCode,
} from "../controllers/visitor.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
router.post("/verify", verifyVisitorAccessCode)

// Protected routes
router.get("/", authenticate, authorize([UserRole.ADMIN]), getAllVisitorAccess)
router.get("/:id", authenticate, getVisitorAccessById)
router.post("/", authenticate, createVisitorAccess)
router.put("/:id", authenticate, updateVisitorAccess)
router.delete("/:id", authenticate, deleteVisitorAccess)
router.get("/tenant/:tenantId", authenticate, getVisitorAccessByTenant)

export default router
