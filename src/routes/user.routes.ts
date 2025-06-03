import express from "express"
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  changePassword,
} from "../controllers/user.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { UserRole } from "../models/User.model"

const router = express.Router()

// Public routes
// None

// Protected routes
router.get("/", authenticate, authorize([UserRole.ADMIN]), getAllUsers)
router.get("/:id", authenticate, getUserById)
router.post("/", authenticate, authorize([UserRole.ADMIN]), createUser)
router.put("/:id", authenticate, updateUser)
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), deleteUser)
router.get("/role/:role", authenticate, authorize([UserRole.ADMIN]), getUsersByRole)
router.post("/:id/change-password", authenticate, changePassword)

export default router
