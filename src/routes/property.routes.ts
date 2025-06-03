import express from "express"
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getUnitsByProperty,
  addPropertyImage,
} from "../controllers/property.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
// None

// Protected routes
router.get("/", authenticate, getAllProperties)
router.get("/:id", authenticate, getPropertyById)
router.post("/", authenticate, authorize([UserRole.ADMIN]), createProperty)
router.put("/:id", authenticate, authorize([UserRole.ADMIN]), updateProperty)
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), deleteProperty)
router.get("/:id/units", authenticate, getUnitsByProperty)
router.post("/:id/images", authenticate, authorize([UserRole.ADMIN]), addPropertyImage)

export default router
