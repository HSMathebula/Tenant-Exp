import express from "express"
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantByUserId,
  addTenantDocument,
} from "../controllers/tenant.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
// None

// Protected routes
router.get("/", authenticate, authorize([UserRole.ADMIN]), getAllTenants)
router.get("/:id", authenticate, getTenantById)
router.post("/", authenticate, authorize([UserRole.ADMIN]), createTenant)
router.put("/:id", authenticate, authorize([UserRole.ADMIN]), updateTenant)
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), deleteTenant)
router.get("/user/:userId", authenticate, getTenantByUserId)
router.post("/:id/documents", authenticate, addTenantDocument)

export default router
