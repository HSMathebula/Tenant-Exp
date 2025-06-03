import express from "express"
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentsByTenant,
  getPaymentsByProperty,
  getPaymentsByStatus,
  processPayment,
  generateRentPayments,
} from "../controllers/payment.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
// None

// Protected routes
router.get("/", authenticate, authorize([UserRole.ADMIN]), getAllPayments)
router.get("/:id", authenticate, getPaymentById)
router.post("/", authenticate, authorize([UserRole.ADMIN]), createPayment)
router.put("/:id", authenticate, authorize([UserRole.ADMIN]), updatePayment)
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), deletePayment)
router.get("/tenant/:tenantId", authenticate, getPaymentsByTenant)
router.get("/property/:propertyId", authenticate, authorize([UserRole.ADMIN]), getPaymentsByProperty)
router.get("/status/:status", authenticate, authorize([UserRole.ADMIN]), getPaymentsByStatus)
router.post("/:id/process", authenticate, processPayment)
router.post("/generate-rent", authenticate, authorize([UserRole.ADMIN]), generateRentPayments)

export default router
