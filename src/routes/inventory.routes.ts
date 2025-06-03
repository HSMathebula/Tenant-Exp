import express from "express"
import {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  updateInventoryQuantity,
} from "../controllers/inventory.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
// None

// Protected routes
router.get("/", authenticate, getAllInventoryItems)
router.get("/low-stock", authenticate, getLowStockItems)
router.get("/:id", authenticate, getInventoryItemById)
router.post("/", authenticate, authorize([UserRole.ADMIN, UserRole.MAINTENANCE]), createInventoryItem)
router.put("/:id", authenticate, authorize([UserRole.ADMIN, UserRole.MAINTENANCE]), updateInventoryItem)
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), deleteInventoryItem)
router.patch("/:id/quantity", authenticate, authorize([UserRole.ADMIN, UserRole.MAINTENANCE]), updateInventoryQuantity)

export default router
